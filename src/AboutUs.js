import Footer from './Footer';
import { Container } from 'react-bootstrap';
import LoggedInNav from './LoggedInNav';
import Navapp from './Navapp';
import { useSession } from './useSession';

function AboutUs(){
    const { status } = useSession('public');
    const isLoggedIn = status === 'verified';

    return(
        <>
        <div className="glow-blob-1"></div>
        <div className="glow-blob-2"></div>
        {isLoggedIn ? <LoggedInNav /> : <Navapp />}
        <div className="main-content-wrapper">
            <Container>
                <div className="glass-panel p-4 p-md-5 mx-auto" style={{maxWidth: '800px'}}>
                    <h3 className="fw-bold mb-4" style={{background: 'linear-gradient(135deg, #fff, var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                        About Us
                    </h3>
                    <p className="text-white-50 mb-5 leading-relaxed">
                        We are a team of students who enjoy building websites in our free time. We made this site to offer educational quizzes that help every child learn and grow smarter.
                    </p>

                    <h3 className="fw-bold mb-4" style={{background: 'linear-gradient(135deg, #fff, var(--color-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block'}}>
                        Privacy Policy
                    </h3>
                    <p className="text-white-50 mb-4 leading-relaxed">
                        This is a demo version of KuisAnak that runs entirely in your browser. It does not use cookies, analytics or a server, and it never sends anything you type over the internet. No real emails are sent: the verification email appears in a demo inbox on the screen.
                    </p>

                    <h5 className="fw-bold text-white mt-4 mb-2">What is saved</h5>
                    <p className="text-white-50 mb-4 leading-relaxed">
                        Accounts you create (with the password stored only as a salted hash) and your recent quiz scores are saved only in this browser's local storage, so your scoreboard is still there next time. Nobody else can see them. Please don't reuse a real password here.
                    </p>

                    <h5 className="fw-bold text-white mt-4 mb-2">Removing your data</h5>
                    <p className="text-white-50 mb-4 leading-relaxed">
                        Sign out to end your session, or clear this site's data in your browser settings to remove your accounts and scores.
                    </p>

                    <h5 className="fw-bold text-white mt-4 mb-2">Children's Privacy</h5>
                    <p className="text-white-50 mb-0 leading-relaxed">
                        No personal information leaves this device. Children can use a nickname and a made-up email address.
                    </p>
                </div>
            </Container>
            <br/><br/>
            <Footer />
        </div>
        </>
    )
}

export default AboutUs;
