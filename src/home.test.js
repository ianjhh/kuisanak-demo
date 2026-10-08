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
                if (body.password !== 'rahasia123') {
                    return [404, 'Wrong username or password!'];
                }
                signedIn = true;
                return [200, { verified: true, token: 'token' }];
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

    const logIn = (password) => {
        fireEvent.change(screen.getByLabelText("Username"), { target: { value: 'budi' } });
        fireEvent.change(screen.getByLabelText("Password"), { target: { value: password } });
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    };

    test("Expect username field to set value as user input", async () =>{
        const usernameInput = screen.getByLabelText('Username');
        expect(usernameInput.value).toBe('');
        fireEvent.change(usernameInput, {target: {value: 'a'}});
        expect(usernameInput.value).toBe('a');
    });

    test("Shows the server's message when the login fails", async () =>{
        logIn('salah');

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Wrong username or password!'));
        expect(screen.getByLabelText('Username')).toHaveValue('budi');
    });

    test("Shows the user's name and recent scores after logging in, without reloading", async () =>{
        logIn('rahasia123');

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
        expect(screen.queryByText('Use the demo account')).not.toBeInTheDocument();
    });
})
