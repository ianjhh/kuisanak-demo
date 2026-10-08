import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { mockApi } from './testing/mockApi';

const quiz = (name, title, questionCount) => ({
    name,
    title,
    category: 'math',
    quizImage: name,
    array: Array.from({ length: questionCount }, (_, i) => ({ question: `${title} question ${i + 1}`, options: ['A', 'B'] })),
});

const QUIZZES = {
    addition: quiz('addition', 'Addition', 3),
    subtraction: quiz('subtraction', 'Subtraction', 3),
};

describe('Quiz', () => {
    let requests;

    const renderAt = (path) => {
        requests = mockApi({
            'GET /api/verifyToken': () => [200, { verified: true, authorizedData: { username: 'budi' } }],
            'POST /api/fetchQuiz': ({ body }) => [200, QUIZZES[body.name] ? JSON.parse(JSON.stringify(QUIZZES[body.name])) : null],
            'POST /api/fetchSimilarQuiz': () => [200, [{ name: 'subtraction', title: 'Subtraction', quizImage: 'subtraction' }]],
            'POST /api/checkAnswer': ({ body }) => [200, { correct: body.answer === 'A', answer: 'A' }],
            'POST /api/submitQuiz': () => [200, { score: 2, total: 3 }],
        });
        render(
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        );
    };

    afterEach(() => requests.restore());

    const progressText = (text) => (_, element) => element.tagName === 'P' && element.textContent === text;

    test('plays a quiz with fewer than 10 questions and lets the server score it', async () => {
        renderAt('/quiz/addition');
        fireEvent.click(await screen.findByText('Start Quiz'));

        for (let number = 1; number <= 3; number++) {
            expect(screen.getByText(progressText(`Question ${number} of 3`))).toBeInTheDocument();
            fireEvent.click(screen.getByLabelText(number === 3 ? 'B' : 'A'));
            fireEvent.click(screen.getByText('Submit Answer'));
            await screen.findByText(number === 3 ? /Wrong!/ : /Correct!/);
            fireEvent.click(screen.getByText(number === 3 ? 'See My Score' : 'Next Question'));
        }

        expect(await screen.findByText('2 / 3')).toBeInTheDocument();
        const submitted = requests.find((r) => r.url === '/api/submitQuiz').body;
        expect(submitted.name).toBe('addition');
        expect(submitted.answers).toHaveLength(3);
    });

    test('asks for suggestions that exclude the current quiz by name', async () => {
        renderAt('/quiz/addition');
        await screen.findByText('Start Quiz');
        expect(requests.find((r) => r.url === '/api/fetchSimilarQuiz').body).toEqual({ quizName: 'addition', category: 'math' });
    });

    test('opening a suggested quiz starts it fresh without reloading the page', async () => {
        renderAt('/quiz/addition');
        fireEvent.click(await screen.findByText('Start Quiz'));
        for (let number = 1; number <= 3; number++) {
            fireEvent.click(screen.getByLabelText('A'));
            fireEvent.click(screen.getByText('Submit Answer'));
            await screen.findByText(/Correct!/);
            fireEvent.click(screen.getByText(number === 3 ? 'See My Score' : 'Next Question'));
        }

        fireEvent.click(await screen.findByText('Start!'));

        expect(await screen.findByText('Subtraction Quiz')).toBeInTheDocument();
        expect(screen.getByText('Start Quiz')).toBeInTheDocument();
        expect(screen.queryByText('Final Score')).not.toBeInTheDocument();
    });

    test('says so when the quiz does not exist', async () => {
        renderAt('/quiz/tidak-ada');
        expect(await screen.findByText(/wasn't found/)).toBeInTheDocument();
    });
});
