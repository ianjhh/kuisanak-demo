import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import Register from './Register';
import { BrowserRouter } from "react-router-dom";
import { mockApi } from './testing/mockApi';

const mockUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
   ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockUsedNavigate,
}));

describe("Register", ()=>{
    let alertSpy;
    let requests;

    // Renders the page against a fake API; `register` answers the sign-up request.
    const renderWith = (register) => {
        requests = mockApi({
            'GET /api/verifyToken': () => [401, 'Your session is not valid'],
            'POST /api/validateEmail': () => [200, 'Email does not exist!'],
            'POST /api/register': register,
        });
        render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
    };

    beforeEach(() => {
        mockUsedNavigate.mockClear();
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        alertSpy.mockRestore();
        requests.restore();
    });

    const fillForm = () => {
        fireEvent.change(screen.getByLabelText('Username'), {target: {value: 'dewi'}});
        fireEvent.change(screen.getByLabelText('Password'), {target: {value: 'rahasia123'}});
        fireEvent.change(screen.getByLabelText('Repeat Password'), {target: {value: 'rahasia123'}});
        fireEvent.change(screen.getByLabelText('Email'), {target: {value: 'dewi@example.com'}});
        fireEvent.click(screen.getByText('Sign Up'));
    };

    test("Shows validation errors when username is under 3 and password is under 8 characters", async () =>{
        renderWith(() => [500, 'unused']);
        /* username and password field test */
        const usernameInput = screen.getByLabelText('Username');
        const passwordInput = screen.getByLabelText('Password');

        /* validation runs on blur, so each field must be changed then blurred */
        fireEvent.change(usernameInput, {target: {value: 'a'}});
        fireEvent.blur(usernameInput);
        fireEvent.change(passwordInput, {target: {value: 'a'}});
        fireEvent.blur(passwordInput);

        await waitFor(() =>
            expect(screen.getByText('Your username must be at least 3 characters!')).toBeInTheDocument()
        );
        await waitFor(() =>
            expect(screen.getByText('Your password must be at least 8 characters!')).toBeInTheDocument()
        );
    })

    test("Sends only the username, password and email, then opens the verify page", async () =>{
        renderWith(() => [200, { message: 'Successful!', token: 'token', emailSent: true }]);
        fillForm();

        await waitFor(() => expect(mockUsedNavigate).toHaveBeenCalledWith('/verify', { replace: true }));
        /* the server hashes the password and decides the account's other fields */
        const signUp = requests.find((r) => r.url === '/api/register');
        expect(signUp.body).toEqual({ username: 'dewi', password: 'rahasia123', email: 'dewi@example.com' });
    })

    test("Shows the server's reason when the username is taken", async () =>{
        renderWith(() => [409, 'That username is taken!']);
        fillForm();

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('That username is taken!'));
        expect(mockUsedNavigate).not.toHaveBeenCalled();
    })
})
