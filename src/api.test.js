import axios from 'axios';
import { configureApi } from './api';
import content from './offline/content.json';
import { DEMO_ACCOUNT } from './offline/server';

// The offline API answers through axios, exactly as the pages call it.
beforeAll(() => configureApi());
beforeEach(() => window.localStorage.clear());

const firstQuiz = content.quizzes[0];
const status = (promise) => promise.then((r) => r.status, (e) => e.response.status);
const inboxCode = async () => (await axios.get('/api/demoInbox')).data.code;
const otherThan = (code) => (code === '000000' ? '111111' : '000000');

const signUp = (username = 'dewi', email = 'dewi@example.com') =>
    axios.post('/api/register', { username, password: 'rahasia123', email });

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

test('signs up, verifies with the emailed code, and then plays', async () => {
    const { data: created } = await signUp();
    expect(created.emailSent).toBe(true);

    const { data: session } = await axios.get('/api/verifyToken');
    expect(session).toMatchObject({ verified: false, authorizedData: { username: 'dewi' } });

    // The "email" is in the demo inbox, for this user only.
    const { data: email } = await axios.get('/api/demoInbox');
    expect(email.to).toBe('dewi@example.com');
    expect(email.code).toMatch(/^\d{6}$/);

    expect(await status(axios.post('/api/setVerified', { verificationCode: otherThan(email.code) }))).toBe(400);
    expect((await axios.post('/api/setVerified', { verificationCode: email.code })).data).toEqual({ verified: true });
    expect((await axios.get('/api/verifyToken')).data.verified).toBe(true);

    const answers = firstQuiz.array.slice(0, 3).map((q, i) => ({ question: q.question, imagesrc: q.imagesrc, answer: i === 0 ? 'wrong' : q.answer }));
    answers.push(answers[1]); // a repeated question counts once
    expect((await axios.post('/api/submitQuiz', { name: firstQuiz.name, answers })).data).toEqual({ score: 2, total: 3 });
    expect((await axios.post('/api/fetchHistory')).data).toEqual([[firstQuiz.name, 2, 3]]);
});

test('follows the sign-up rules of the real API', async () => {
    await signUp();
    expect(await status(axios.post('/api/validateEmail', { email: 'dewi@example.com' }))).toBe(409);
    expect(await status(axios.post('/api/validateEmail', { email: 'new@example.com' }))).toBe(200);
    expect(await status(signUp('dewi', 'other@example.com'))).toBe(409);
    expect(await status(signUp('sari', 'dewi@example.com'))).toBe(409);
    expect(await status(axios.post('/api/register', { username: 'ab', password: 'rahasia123', email: 'a@b.co' }))).toBe(400);
    expect(await status(axios.post('/api/register', { username: 'abc', password: 'short', email: 'a@b.co' }))).toBe(400);
});

test('stores a salted hash, never the password itself', async () => {
    await signUp();
    const saved = window.localStorage.getItem('kuisanak.demo.accounts');
    expect(saved).not.toContain('rahasia123');
    expect(JSON.parse(saved).users.dewi.password).toMatch(/^[0-9a-f]{64}$/);
});

test('signs in with the right password only', async () => {
    await signUp();
    await axios.get('/api/logout');
    expect(await status(axios.get('/api/verifyToken'))).toBe(401);
    expect(await status(axios.post('/api/login', { username: 'dewi', password: 'wrong-password' }))).toBe(404);
    expect((await axios.post('/api/login', { username: 'dewi', password: 'rahasia123' })).data.verified).toBe(false);
});

test('limits resends and wrong codes like the real API', async () => {
    await signUp();
    // A new code only after a minute.
    expect(await status(axios.post('/api/resendCode'))).toBe(429);
    const code = await inboxCode();
    for (let i = 0; i < 5; i++) {
        expect(await status(axios.post('/api/setVerified', { verificationCode: otherThan(code) }))).toBe(400);
    }
    // After 5 wrong tries even the right code is refused until a new one is sent.
    expect(await status(axios.post('/api/setVerified', { verificationCode: code }))).toBe(429);
});

test('needs a signed-in user to save scores', async () => {
    expect(await status(axios.post('/api/submitQuiz', { name: firstQuiz.name, answers: [] }))).toBe(401);
    expect(await status(axios.post('/api/fetchHistory'))).toBe(401);
});

test('has a ready-made, verified demo account with some scores', async () => {
    const { data } = await axios.post('/api/login', DEMO_ACCOUNT);
    expect(data.verified).toBe(true);
    expect((await axios.post('/api/fetchHistory')).data.length).toBeGreaterThan(0);
});

test('serves fact lists without the facts, and whole articles by link name', async () => {
    const { data: list } = await axios.get('/api/fetchSpaceFacts');
    expect(list[0].factsarr).toBeUndefined();
    const { data: article } = await axios.post('/api/fetchSpaceFact', { link_name: list[0].link_name });
    expect(article.factsarr.length).toBeGreaterThan(0);
});

test('grades every question of every quiz correctly', async () => {
    await axios.post('/api/login', DEMO_ACCOUNT);
    for (const quiz of content.quizzes) {
        const answers = quiz.array.map((q) => ({ question: q.question, imagesrc: q.imagesrc, answer: q.answer }));
        const { data } = await axios.post('/api/submitQuiz', { name: quiz.name, answers });
        expect([quiz.name, data.score]).toEqual([quiz.name, new Set(answers.map((a) => `${a.question}|${a.imagesrc}`)).size]);
    }
});
