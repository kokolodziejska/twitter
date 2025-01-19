import React from "react";
import { Link, useLocation,useNavigate  } from "react-router-dom";
import blueImage from "../../assets/blue.jpg"; // Załaduj obrazek
import "../../style/Register.css"; // Załaduj istniejący CSS (jeśli pasuje do układu)

function WelcomePage() {
    const location = useLocation();
    const userName = location.state?.userName || "Guest";
    const navigate = useNavigate();

    const handleLoginRedirect = () => {
        navigate("/login", { state: { userName } });
    };
    return (
        <div className="reister-container">
            <div className="signUp-contaner">
                <h1 className="title">Buzzly</h1>
                <div className="welcome-panel">
                    <div className="greating">
                        <p className="sing-up">Hello </p>
                        <p className="sing-up username-grating">{userName}</p>
                        <p className="sing-up">!</p>
                    </div>
                    <div className="line-welcome"></div>
                    <p className="success-message">
                        You have been successfully registered. 
                    </p>
                    <div className="go-to-log-in">
                    <p className="login-in-message">Please </p>  
                    <span
                            onClick={handleLoginRedirect}
                            className="login-in-message log-in"
                            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}>log in</span>
                    <p className="login-in-message">to continue.</p>
                    </div>
                    
                </div>
            </div>
            <div className="picure">
                <img src={blueImage} alt="Decorative" className="blue-picture-register" />
            </div>
        </div>
    );
}

export default WelcomePage;
