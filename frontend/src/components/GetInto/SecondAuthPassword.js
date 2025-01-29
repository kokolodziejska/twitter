import blueImage from "../../assets/blue.jpg";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import API from "../configurations/api";

function SeconAuthPassword() {
    const location = useLocation();
    const navigate = useNavigate();

    const doMain = location.state?.doMain || "";
    const numFromState = location.state?.num || ""; 

    const [totpCode, setTotpCode] = useState("");
    const [mailCode, setMailCode] = useState("");
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0); // Licznik nieudanych prób

    const handleNavigation = (path) => {
        navigate(path);
    };

    const isMailCodeValid = () => {
        if (!mailCode) {
            setError("Mail code is required.");
            return false;
        }
        console.log(numFromState)
        console.log(mailCode)
    
        const newAttempts = attempts + 1;
    
        if (parseInt(mailCode, 10) === parseInt(numFromState, 10)) {  
            return true;
        } else {
            setAttempts(newAttempts);
            setError("Invalid mail code. Please check your email.");
    
            if (newAttempts >= 5) {
                navigate("/login");
            }
            return false;
        }
    };

    const handleVerifyTotp = async () => {

        if (!isMailCodeValid()) {
            return; 
        }
        try { 
            const response = await API.post("/login/verify-totp", null, {
                params: { 
                    code: parseInt(totpCode)    
                }
            });

            if(doMain){
                
                handleNavigation("/new-password-user")
            }
            else{
                handleNavigation("/new-password")
            }

        } catch (err) {
            setError("Invalid TOTP code. Please try again.");
            console.error("Error during TOTP verification:", err);
        }
    };

    return (
        <div className="login">
            <div className="login-left">
                <h1 className="title">Buzzly</h1>
                <div className="login-panel">
                    <h2 className="login-text">Second Authentication</h2>

                    <div className="form-login">
                        
                        <label htmlFor="mailCode">Enter your code from Mail:</label>
                        <input
                            type="number"
                            id="mailCode"
                            value={mailCode}
                            onChange={(e) => setMailCode(e.target.value)} 
                            placeholder="6-digit code"
                        />

                       
                        <label htmlFor="totpCode">Enter your TOTP code:</label>
                        <input
                            type="number"
                            id="totpCode"
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value)}
                            placeholder="6-digit code"
                        />

                        <button onClick={handleVerifyTotp} className="button-login">
                            Verify
                        </button>
                        {error && <p className="error-message-red">{error}</p>}
                    </div>
                </div>
            </div>
            <div className="login-right">
                <img src={blueImage} alt="Decorative" className="blue-picture" />
            </div>
        </div>
    );
}

export default SeconAuthPassword;
