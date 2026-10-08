import { Container } from "react-bootstrap";
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import axios from 'axios';
import { useNavigate, Link } from "react-router-dom";
import { useSession } from './useSession';

function Register(props){
    useSession('guests');
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [usernameMsg, setUsernameMsg] = useState(null);
    const [passwordMsg, setPasswordMsg] = useState(null);
    const [password2Msg, setPassword2Msg] = useState(null);
    const [emailIsValid, setEmailIsValid] = useState(null);
    const [email, setEmail] = useState("");
    const [correctEmailFormat, setCorrectEmailFormat] = useState(true);
    const navigate = useNavigate();

    const validateEmailFormat = (email) => {
      return String(email)
        .toLowerCase()
        .match(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const handleRegister = (email) =>{
        let validEmail = validateEmailFormat(email)

        if(!validEmail){
            setCorrectEmailFormat(false)
            return;
        }
        else{
            setCorrectEmailFormat(true)
        }

        axios.post('/api/validateEmail', {
            email: email,
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            setEmailIsValid(true)

            if (username.length < 3 || password.length < 8 || password !== password2){
                alert('Please check the form: username at least 3 characters, password at least 8, and both passwords the same.')
                return;
            }

            /* the server validates the account and hashes the password */
            return axios.post('/api/register', {
                username: username,
                password: password,
                email: email
            })
            .then(function (response) {
                /* in this demo the email arrives in the demo inbox on the verify page */
                navigate('/verify', { replace: true })
            })
            .catch(function (error) {
                /* for example "That username is taken!" */
                alert(error.response.data)
            });
        })
        .catch(function (e) {
            if(e.response && e.response.status === 409){
                setEmailIsValid(false)
            }
            else{
                alert(e.response && typeof e.response.data === 'string' ? e.response.data : 'Oops, something went wrong!')
            }
        });
    }

    const validateUsername = (username) =>{
        if(username.length < 3 && username){
            setUsernameMsg('Your username must be at least 3 characters!')
        }
        else{
            setUsernameMsg(null)
        }
    }

    const validatePassword = (password) =>{
        if(password.length < 8 && password){
            setPasswordMsg('Your password must be at least 8 characters!')
        }
        else{
            setPasswordMsg(null)
        }
    }

    const validateSamePassword = (password, password2) =>{
        if(password === password2 || password2 === ''){
            setPassword2Msg(null)
        }
        else{
            setPassword2Msg('The passwords do not match!')
        }
    }

    return(
        <div className="position-relative d-flex justify-content-center align-items-center py-5" style={{minHeight: '100vh', backgroundColor: 'var(--bg-main)'}}>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            <Container className="position-relative" style={{zIndex: 2, maxWidth: '450px'}}>
                <div className="glass-panel auth-card p-4 p-sm-5">
                    <h3 className="text-center fw-bold mb-4">Create an Account</h3>
                    <Form>
                        <Form.Group className="mb-3" controlId="formBasicUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control 
                                type="text" 
                                className="form-input-custom" 
                                onChange={(e)=>{setUsername(e.target.value)}} 
                                onBlur={()=>{validateUsername(username)}}  
                                value={username} 
                            />
                            {usernameMsg && <Form.Text className="text-danger d-block mt-1">{usernameMsg}</Form.Text>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                className="form-input-custom" 
                                onChange={(e)=>{setPassword(e.target.value)}} 
                                onBlur={()=>{validatePassword(password)}} 
                                value={password} 
                            />
                            {passwordMsg && <Form.Text className="text-danger d-block mt-1">{passwordMsg}</Form.Text>}
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword2" onBlur={()=>{validateSamePassword(password, password2)}}>
                            <Form.Label>Repeat Password</Form.Label>
                            <Form.Control 
                                type="password" 
                                className="form-input-custom" 
                                onChange={(e)=>{setPassword2(e.target.value)}} 
                                value={password2} 
                            />
                            {password2Msg && <Form.Text className="text-danger d-block mt-1">{password2Msg}</Form.Text>}
                        </Form.Group>

                        <Form.Group className="mb-4" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                className="form-input-custom" 
                                onChange={(e)=>{setEmail(e.target.value)}} 
                                value={email} 
                            />
                            {emailIsValid === true && correctEmailFormat && <Form.Text className="text-success d-block mt-1">This email is available!</Form.Text>}
                            {emailIsValid === false && correctEmailFormat && <Form.Text className="text-danger d-block mt-1">This email is already taken!</Form.Text>}
                            {!correctEmailFormat && <Form.Text className="text-danger d-block mt-1">Invalid email format!</Form.Text>}
                        </Form.Group>
                
                        <Button className="btn-success-glow w-100 py-2 fs-5" type="button" onClick={()=>{handleRegister(email)}}>
                            Sign Up
                        </Button>
                    </Form>
                    <p className='mt-4 text-center text-white-50 mb-0'>
                        Already have an account? <Link to='/login' className='text-decoration-none text-info fw-semibold'>Sign in here</Link>
                    </p>
                    <p className='mt-3 text-center mb-0'>
                        <Link to='/' className='text-decoration-none text-white-50 small'><i className="bi bi-arrow-left"></i> Back to home</Link>
                    </p>
                </div>
            </Container>
        </div>
    );
}

export default Register;
