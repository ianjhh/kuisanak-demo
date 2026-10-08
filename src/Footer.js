import { Link } from "react-router-dom";
import './Footer.css';

function Footer(props){
    return(
        <>
        <footer className="bg-black text-white py-3">
            <ul className="nav justify-content-center border-bottom pb-3 mb-3">
                <li className="nav-item footer-text"><Link to='/' className="px-2 text-white text-decoration-none">home</Link></li>
                <li className="nav-item footer-text"><Link to='/about-us' className="px-2 text-white text-decoration-none">tentang kami</Link></li>
                <li className="nav-item footer-text"><Link to='/sitemap' className="px-2 text-white text-decoration-none">sitemap</Link></li>
                <li className="nav-item footer-text"><Link to='/about-us' className="px-2 text-white text-decoration-none">kebijakan privasi</Link></li>
            </ul>
            <p className="text-center text-white mb-1">© 2024 KuisAnak, Inc</p>
            <p className="text-center text-white-50 small mb-0">
                Versi demo offline · <a href="https://github.com/ianjhh/quizanak" target="_blank" rel="noreferrer" className="text-white-50">kode lengkap (full-stack)</a>
            </p>
        </footer>
        </>
    );
}

export default Footer;
