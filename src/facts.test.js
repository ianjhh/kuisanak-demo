import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { mockApi } from './testing/mockApi';

const signedIn = () => [200, { verified: true, authorizedData: { username: 'budi' } }];
const guest = () => [401, 'Sesi tidak valid'];

describe('fact pages', () => {
    let requests;

    const renderAt = (path, verifyToken) => {
        requests = mockApi({
            'GET /api/verifyToken': verifyToken,
            'GET /api/fetchAnimalFacts': () => [200, [{ link_name: 'cat-facts', title: 'Cat Facts', image: 'faktakucing' }]],
            'GET /api/fetchSpaceFacts': () => [200, [{ link_name: 'mars-facts', title: 'Mars Facts', image: 'mars' }]],
            'POST /api/fetchAnimalFact': () => [200, { title: 'Cat Facts', factsarr: [['Cats sleep about 12 to 16 hours a day.', '']] }],
            'GET /api/fetchAnimalQuiz': () => [200, []],
            'GET /api/fetchMathQuiz': () => [200, []],
            'GET /api/fetchLanguageQuiz': () => [200, []],
            'GET /api/fetchMiscellaneousQuiz': () => [200, []],
        });
        render(
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        );
    };

    afterEach(() => requests.restore());

    test('lists a category and loads the next one when switching categories', async () => {
        renderAt('/animal-facts', guest);
        expect(await screen.findByText('Cat Facts')).toBeInTheDocument();
        expect(screen.getByText('Animal Facts')).toBeInTheDocument();

        fireEvent.click(screen.getByText('Space'));

        expect(await screen.findByText('Mars Facts')).toBeInTheDocument();
        expect(screen.getByText('Space Facts')).toBeInTheDocument();
        expect(screen.queryByText('Cat Facts')).not.toBeInTheDocument();
    });

    test('shows an article to a verified user', async () => {
        renderAt('/animal-facts/cat-facts', signedIn);
        expect(await screen.findByText('Cats sleep about 12 to 16 hours a day.')).toBeInTheDocument();
        expect(requests.find((r) => r.url === '/api/fetchAnimalFact').body).toEqual({ link_name: 'cat-facts' });
    });

    test('sends guests who open an article to the login page', async () => {
        renderAt('/animal-facts/cat-facts', guest);
        await waitFor(() => expect(screen.getByText('Use the demo account')).toBeInTheDocument());
        expect(screen.queryByText('Cats sleep about 12 to 16 hours a day.')).not.toBeInTheDocument();
    });
});
