import Navapp from './Navapp';
import Footer from './Footer';
import './Home.css';
import { useEffect, useState } from 'react';
import LoggedInNav from './LoggedInNav';
import axios from 'axios';
import { Row, Container, Form, Button, Card, Col } from 'react-bootstrap';
import { useNavigate, Link } from "react-router-dom";
import img1 from './assets/images/binatang-laut1.jpg';
import { useSession } from './useSession';
import Scoreboard from './Scoreboard';

function Home(props){
    const { status, username: signedInAs, refresh } = useSession('public');
    const isLoggedIn = status === 'verified';
    const [username, setUsername] = useState("");
    const [historyList, setHistoryList] = useState([]);
    const navigate = useNavigate();

    const handleLogin = () =>{
        axios.post('/api/login', {
            username: username
        })
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if(response.data.verified === true){
                /* check the session again instead of reloading the page */
                refresh()
            }
            else{
                navigate('/verify', { replace: true })
            }
        })
        .catch(function (error) {
            alert(error.response.data)
        });
    }

    /* the server reads the user from the session */
    useEffect(()=>{
        if (!isLoggedIn){
            return;
        }
        axios.post('/api/fetchHistory')
        .then(function (response) {
            /* ONLY RUNS IF SUCCESS, NOT EVEN WHEN CODE 404 */
            if (response.status === 200){
                setHistoryList(response.data)
            }
        })
        .catch(function (error) {
            console.log(error.response ? error.response.status : error);
        });
    }, [isLoggedIn])

    return(
        <>
            <div className="glow-blob-1"></div>
            <div className="glow-blob-2"></div>
            {isLoggedIn ? <LoggedInNav /> : <Navapp />}
            <div className='main-content-wrapper'>
                <Container>
                    <Row>
                        <div className='col-12 col-md-8'>
                            <h1 className="main-heading">Quizzes for kids! 🌴</h1>
                            {/* --------------CARDS-------------- */}
                            <Row xs={1} sm={2} lg={3} className="g-4 main-container">
                                <Col className='quiz-col-home'>
                                    <Link to='/quiz' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={img1} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Quizzes</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Quizzes about animals, math and more!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>

                                <Col className='quiz-col-home'>
                                    <Link to='/animal-facts' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={require(`./assets/images/faktabinatang.jpg`)} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Animal Facts</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Learn fun facts about animals!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                                
                                <Col className='quiz-col-home'>
                                    <Link to='/space-facts' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={require(`./assets/images/faktaangkasa.jpg`)} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Space Facts</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Learn fun facts about space!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
             
                                <Col className='quiz-col-home'>
                                    <Link to='/weird-facts' className='text-decoration-none'>
                                        <Card className='glass-panel glass-panel-hover quiz-card-custom'>
                                            <Card.Img variant="top" src={require(`./assets/images/faktasejarah.jpg`)} className='img-card-home' />
                                            <Card.Body className='card-body-home'>
                                                <Card.Title className="card-title-custom">Weird Facts</Card.Title>
                                                <Card.Text className='card-description-home'>
                                                    Learn facts that are weird but true!
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Link>
                                </Col>
                            </Row>
                        </div>
                        {isLoggedIn ? (
                            <div className='col-12 col-md-4 mt-4 mt-md-0'>
                                <Scoreboard name={signedInAs} history={historyList} />
                            </div>
                        ) : (
                            <div className='col-12 col-md-4 mt-4 mt-md-0'>
                                <div className="glass-panel auth-card loginarea">
                                    <h3 className="text-center fw-bold">What's your name?</h3>
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
                                        <Button className="btn-primary-glow w-100 py-2 mt-2" type="submit">
                                            Start
                                        </Button>
                                    </Form>
                                    <p className='mt-4 text-center text-white-50 small mb-0'>
                                        Demo version: no account and no server. Your scores are saved in this browser.
                                    </p>
                                </div>
                            </div>
                        )}
                    </Row>
                </Container>
            </div>
            <Footer />
        </>
    );
}

export default Home;
