import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from './Home';
import { mockApi } from './testing/mockApi';

describe("Home", ()=>{
    let alertSpy;
    let requests;
    let signedIn;

    beforeEach(() => {
        signedIn = false;
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
        requests = mockApi({
            'GET /api/verifyToken': () => (signedIn
                ? [200, { verified: true, authorizedData: { username: 'budi' } }]
                : [401, 'Sesi tidak valid']),
            'POST /api/login': ({ body }) => {
                if (!body.username.trim()) {
                    return [400, 'Please type your name first!'];
                }
                signedIn = true;
                return [200, { verified: true }];
            },
            'POST /api/fetchHistory': () => [200, [['addition', 8], ['colors', 10]]],
        });
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        );
    });

    afterEach(() => {
        alertSpy.mockRestore();
        requests.restore();
    });

    const logIn = (name) => {
        fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
        fireEvent.click(screen.getByText('Start'));
    };

    test("Expect the name field to set value as user input", async () =>{
        const usernameInput = screen.getByLabelText('Name');
        expect(usernameInput.value).toBe('');
        fireEvent.change(usernameInput, {target: {value: 'a'}});
        expect(usernameInput.value).toBe('a');
    });

    test("Asks again when no name is given", async () =>{
        logIn('   ');

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Please type your name first!'));
        expect(screen.getByText('Start')).not.toBeDisabled();
    });

    test("Shows the user's name and recent scores after logging in, without reloading", async () =>{
        logIn('budi');

        expect(await screen.findByText('budi')).toBeInTheDocument();
        await screen.findByText('colors');
        /* newest first */
        const items = screen.getAllByRole('listitem');
        expect(items[0]).toHaveTextContent('colors');
        expect(items[0]).toHaveTextContent('10/10');
        expect(items[1]).toHaveTextContent('addition');
        expect(items[1]).toHaveTextContent('8/10');
        /* quizzes played, average and best */
        expect(screen.getByText('90%')).toBeInTheDocument();
        expect(screen.queryByText('Start')).not.toBeInTheDocument();
    });
})
