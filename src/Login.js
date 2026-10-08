import { Container } from "react-bootstrap";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { useSession } from './useSession';

function Login(props){
    useSession('guests');
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleLogin = () =>{
        axios.post('/api/login', {
            username: username
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.data.verified === true){
                navigate('/', { replace: true })
            }
            else{
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            alert(error.response.data)
            console.log(error.response ? error.response.status : error);
        });
    }

    return(
        <div className="position-relative d-flex justify-content-center align-items-center" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            <Container className="position-relative" style={{zIndex: 2, maxWidth: '400px'}}>
                <div className="glass-panel auth-card p-4 p-sm-5">
                    <h3 className="text-center fw-bold mb-4">What's your name?</h3>
                    <Form onSubmit={(e)=>{e.preventDefault(); handleLogin()}}>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label>Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                className="form-input-custom" 
                                onChange={(e)=>{setUsername(e.target.value)}} 
                                value={username} 
                            />
                        </Form.Group>

                        <Button className="btn-primary-glow w-100 py-2 fs-5" type="submit">
                            Start
                        </Button>
                    </Form>
                    <p className='mt-4 text-center text-white-50 small mb-0'>
                        Demo version: no account and no server. Your scores are saved in this browser.
                    </p>
                    <p className='mt-3 text-center mb-0'>
                        <Link to='/' className='text-decoration-none text-white-50 small'><i className="bi bi-arrow-left"></i> Back to home</Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}

export default Login;
