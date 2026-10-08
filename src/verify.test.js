import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Verify from './Verify';
import { mockApi } from './testing/mockApi';

describe('Verify', () => {
    let alertSpy;
    let requests;

    const renderWith = (routes) => {
        requests = mockApi({
            'GET /api/verifyToken': () => [200, { verified: false, authorizedData: { username: 'dewi' } }],
            ...routes,
        });
        render(
            <MemoryRouter>
                <Verify />
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        alertSpy.mockRestore();
        requests.restore();
    });

    test('submits only the digits of the code and confirms the account', async () => {
        renderWith({ 'POST /api/setVerified': () => [200, { verified: true }] });

        fireEvent.change(screen.getByLabelText('Verification Code'), { target: { value: '12 34-56' } });
        fireEvent.click(screen.getByText('Verify!'));

        await waitFor(() => expect(screen.getByText(/Your account is verified/)).toBeInTheDocument());
        expect(requests.find((r) => r.url === '/api/setVerified').body).toEqual({ verificationCode: '123456' });
    });

    test("shows the server's reason for a rejected code", async () => {
        renderWith({ 'POST /api/setVerified': () => [400, 'Wrong verification code!'] });

        fireEvent.change(screen.getByLabelText('Verification Code'), { target: { value: '000000' } });
        fireEvent.click(screen.getByText('Verify!'));

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Wrong verification code!'));
    });

    test('asks for a new code right away, without waiting for the page to load a username', async () => {
        renderWith({ 'POST /api/resendCode': () => [429, 'Please wait 42 seconds before asking for a new code.'] });

        fireEvent.click(screen.getByText('Resend Code'));

        await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Please wait 42 seconds before asking for a new code.'));
        expect(requests.find((r) => r.url === '/api/resendCode').body).toBeUndefined();
    });

    test('shows the demo inbox with the email the real site would send', async () => {
        renderWith({ 'GET /api/demoInbox': () => [200, { to: 'dewi@example.com', username: 'dewi', subject: 'Your KuisAnak verification code: 482913', code: '482913' }] });

        expect(await screen.findByText('482913')).toBeInTheDocument();
        expect(screen.getByText('To: dewi@example.com')).toBeInTheDocument();
    });
});
