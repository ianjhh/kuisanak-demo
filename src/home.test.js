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
                    return [400, 'Tulis namamu dulu, ya!'];
                }
                signedIn = true;
                return [200, { verified: true }];
            },
            'POST /api/fetchHistory': () => [200, [['penjumlahan', 8], ['warna', 10]]],
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
        fireEvent.change(screen.getByLabelText("Nama"), { target: { value: name } });
        fireEvent.click(screen.getByText('Mulai'));
    };

    test("Expect the name field to set value as user input", async () =>{
        const usernameInput = screen.getByLabelText('Nama');
        expect(usernameInput.value).toBe('');
        fireEvent.change(usernameInput, {target: {value: 'a'}});
        expect(usernameInput.value).toBe('a');
    });

    test("Asks again when no name is given", async () =>{
        logIn('   ');

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Tulis namamu dulu, ya!'));
        expect(screen.getByText('Mulai')).not.toBeDisabled();
    });

    test("Shows the user's name and recent scores after logging in, without reloading", async () =>{
        logIn('budi');

        expect(await screen.findByText('budi')).toBeInTheDocument();
        await screen.findByText('warna');
        /* newest first */
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toHaveTextContent('warna10');
        expect(rows[2]).toHaveTextContent('penjumlahan8');
        expect(screen.queryByText('Mulai')).not.toBeInTheDocument();
    });
})
