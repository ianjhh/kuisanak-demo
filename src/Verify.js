import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from './useSession';
import './Verify.css';

function Verify(props){
    useSession('verify');
    const [verified, setVerified] = useState(false);
    const [code, setCode] = useState("");
    const [inbox, setInbox] = useState(null);
    const navigate = useNavigate();

    /* Demo only: the real site emails the code; here the email lands in a demo inbox. */
    const loadInbox = useCallback(() => {
        axios.get('/api/demoInbox')
        .then((response) => setInbox(response.data))
        .catch(() => setInbox(null));
    }, []);
    useEffect(loadInbox, [loadInbox]);

    const handleLogout = () =>{
        axios.get('/api/logout', { withCredentials: true })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            navigate('/login', { replace: true })
        })
        .catch(function (error) {
            alert(error.response ? error.response.data : error)
            console.log(error.response ? error.response.status : error);
        });
    }

    const handleVerify = () =>{
        axios.post('/api/setVerified', {verificationCode: code})
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.status===200){
                setVerified(true)
        }})
        .catch(function (error) {
            alert(error.response ? error.response.data : error)
            console.log(error.response ? error.response.status : error);
        });
    }

    /* the server sends the code to the signed-in user's own email */
    const handleResendCode = () =>{
        axios.post('/api/resendCode')
        .then(function (response) {
            if(response.status===200){
                alert('A new verification email was sent! Check the demo inbox below.')
                loadInbox()
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
            /* for example the one-minute wait between codes */
            alert(error.response && error.response.data ? error.response.data : 'Could not send a new verification code!');
        });
    }

    return(
        <div className="position-relative d-flex justify-content-center align-items-center" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            <Container className="position-relative" style={{zIndex: 2, maxWidth: '450px'}}>
                <div className="glass-panel auth-card p-4 p-sm-5">
                    {!verified ? (
                        <>
                            <h3 className="text-center fw-bold mb-3">Verify Your Account</h3>
                            <p className="text-white-50 text-center small mb-4">
                                Enter the 6-digit verification code we sent to your email.
                            </p>
                            <Form>
                                <Form.Group className="mb-4 text-center" controlId="formVerificationCode">
                                    <Form.Label className="d-block mb-2">Verification Code</Form.Label>
                                    <Form.Control
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        className="form-input-custom text-center fs-4 letter-spacing-lg mx-auto"
                                        style={{maxWidth: '200px', letterSpacing: '4px'}}
                                        onChange={(e)=>{setCode(e.target.value.replace(/\D/g, ''))}}
                                        value={code}
                                        maxLength="6"
                                    />
                                </Form.Group>
                        
                                <Button className="btn-primary-glow w-100 py-2 fs-5 mb-3" type="button" onClick={handleVerify}>
                                    Verify!
                                </Button>
                                
                                <Button className="w-100 py-2 btn-success-glow mb-3" type="button" onClick={handleResendCode}>
                                    Resend Code
                                </Button>
                                
                                <Button className="w-100 py-2 btn-danger-glow" type="button" onClick={handleLogout}>
                                    Sign out
                                </Button>
                            </Form>
                            <DemoInbox email={inbox} />
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="correct-alert mb-4 w-100">
                                <i className="bi bi-check-circle-fill me-2 fs-4 d-block mb-2"></i> Your account is verified!
                            </div>
                            <Link to="/" className="text-decoration-none">
                                <Button className="btn-primary-glow px-4 py-2">Start a Quiz</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    )
}

// Shows the email the full-stack site would have sent, since this demo has no mail server.
function DemoInbox({ email }) {
    if (!email) {
        return null;
    }
    return (
        <div className="demo-inbox mt-4" aria-label="Demo inbox">
            <div className="demo-inbox-label"><i className="bi bi-envelope-fill me-2"></i>Demo inbox</div>
            <div className="demo-inbox-meta">To: {email.to}</div>
            <div className="demo-inbox-subject">{email.subject}</div>
            <p className="mb-1">Hi {email.username}!</p>
            <p className="mb-1">Your KuisAnak verification code is:</p>
            <div className="demo-inbox-code">{email.code}</div>
            <p className="demo-inbox-note mb-0">
                This demo has no mail server, so the email appears here. The full-stack version sends it for real.
            </p>
        </div>
    );
}

export default Verify;
