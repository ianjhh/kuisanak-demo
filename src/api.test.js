import axios from 'axios';
import { configureApi } from './api';
import content from './offline/content.json';

// The offline API answers through axios, exactly as the pages call it.
beforeAll(() => configureApi());
beforeEach(() => window.localStorage.clear());

const firstQuiz = content.quizzes[0];

test('lists quizzes by category as cards, without the questions', async () => {
    const { data } = await axios.get('/api/fetchAnimalQuiz');
    expect(data.length).toBeGreaterThan(0);
    expect(data.every((quiz) => quiz.category === 'animal')).toBe(true);
    expect(data[0].array).toBeUndefined();
});

test('sends a quiz without its answers and grades one answer', async () => {
    const { data: quiz } = await axios.post('/api/fetchQuiz', { name: firstQuiz.name });
    expect(quiz.array).toHaveLength(firstQuiz.array.length);
    expect(quiz.array.some((question) => 'answer' in question)).toBe(false);

    // Picture quizzes repeat the same question text, so the picture tells them apart.
    for (const question of firstQuiz.array.slice(0, 5)) {
        const { data } = await axios.post('/api/checkAnswer', { name: firstQuiz.name, question: question.question, imagesrc: question.imagesrc, answer: question.answer });
        expect(data).toEqual({ correct: true, answer: question.answer });
    }
});

test('needs a name before saving a score', async () => {
    await expect(axios.get('/api/verifyToken')).rejects.toMatchObject({ response: { status: 401 } });
    await expect(axios.post('/api/submitQuiz', { name: firstQuiz.name, answers: [] }))
        .rejects.toMatchObject({ response: { status: 401 } });
});

test('signs in with a name, scores a quiz and keeps the last 10 results', async () => {
    const { data: login } = await axios.post('/api/login', { username: '  Dewi ' });
    expect(login.verified).toBe(true);
    const { data: session } = await axios.get('/api/verifyToken');
    expect(session.authorizedData.username).toBe('Dewi');

    const answers = firstQuiz.array.slice(0, 3).map((q, i) => ({ question: q.question, imagesrc: q.imagesrc, answer: i === 0 ? 'salah' : q.answer }));
    answers.push(answers[1]); // a repeated question counts once
    const { data: result } = await axios.post('/api/submitQuiz', { name: firstQuiz.name, answers });
    expect(result).toEqual({ score: 2, total: 3 });
    expect((await axios.post('/api/fetchHistory')).data[0]).toEqual([firstQuiz.name, 2, 3]);

    for (let i = 0; i < 12; i++) {
        await axios.post('/api/submitQuiz', { name: firstQuiz.name, answers: [] });
    }
    const { data: history } = await axios.post('/api/fetchHistory');
    expect(history).toHaveLength(10);
    expect(history[9]).toEqual([firstQuiz.name, 0, 0]);
});

test('logging out forgets the name but keeps the scores for next time', async () => {
    await axios.post('/api/login', { username: 'Budi' });
    await axios.post('/api/submitQuiz', { name: firstQuiz.name, answers: [] });
    await axios.get('/api/logout');
    await expect(axios.get('/api/verifyToken')).rejects.toMatchObject({ response: { status: 401 } });

    await axios.post('/api/login', { username: 'Budi' });
    const { data: history } = await axios.post('/api/fetchHistory');
    expect(history).toHaveLength(1);
});

test('serves fact lists without the facts, and whole articles by link name', async () => {
    const { data: list } = await axios.get('/api/fetchSpaceFacts');
    expect(list[0].factsarr).toBeUndefined();
    const { data: article } = await axios.post('/api/fetchSpaceFact', { link_name: list[0].link_name });
    expect(article.factsarr.length).toBeGreaterThan(0);
});

test('grades every question of every quiz correctly', async () => {
    await axios.post('/api/login', { username: 'Tester' });
    for (const quiz of content.quizzes) {
        const answers = quiz.array.map((q) => ({ question: q.question, imagesrc: q.imagesrc, answer: q.answer }));
        const { data } = await axios.post('/api/submitQuiz', { name: quiz.name, answers });
        expect([quiz.name, data.score]).toEqual([quiz.name, new Set(answers.map((a) => `${a.question}|${a.imagesrc}`)).size]);
    }
});
