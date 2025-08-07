import { Link } from "react-router-dom";
import "./IntroductionPage.css";

export default function IntroductionPage() {
    return (
        <div className="introduction-page">
            <nav>
                <a className="nav-introduction" href="/">Aquarium management</a>
                <Link to="/auth/login">
                    <button className="login-btn">Login</button>
                </Link>
            </nav>
        </div>
    );
}