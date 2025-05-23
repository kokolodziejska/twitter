import blueImage from "../../assets/blue.jpg";
import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import API from "../configurations/api";

function SeconAuth() {
    const location = useLocation();
    const navigate = useNavigate();


    const [totpCode, setTotpCode] = useState("");
    const [error, setError] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const response = await API.post("/login/enable-totp", null, {
                    responseType: "blob" 
                });
    
                console.log("QR Code response:", response);
                console.log("typeof response.data:", typeof response.data);  
                console.log("Content-Type:", response.headers["content-type"]);
    
                if (response.headers["content-type"] !== "image/png") {
                    throw new Error("Invalid response type. Expected image/png.");
                }
    
                const qrCodeUrl = URL.createObjectURL(response.data);
                setQrCodeUrl(qrCodeUrl);
            } catch (err) {
                console.error("Error generating QR code:", err);
            }
        };
    
        fetchQrCode();
    }, []);

    const handleVerifyTotp = async () => {
        try {

            const cleanedTotpCode = totpCode.replace(/[\s\t]/g, "");

            if (cleanedTotpCode.length !== 6) {
                setError("TOTP code must be exactly 6 digits.");
                return;
            }

            const response = await API.post("/login/verify-totp", null, {
                params: {
                    code: cleanedTotpCode
                }
            });

            navigate("/Buzzly");
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

                    {qrCodeUrl ? (
                        <div className="qr-container">
                            <img src={qrCodeUrl} alt="QR Code for TOTP" className="qr-code" />
                        </div>
                    ) : (
                        <p></p>
                    )}

                    <div className="form-login">
                        <label htmlFor="totpCode">Enter your TOTP code:</label>
                        <input
                            type="text"
                            id="totpCode"
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value)}
                            placeholder="6-digit code"
                        />
                        <button onClick={handleVerifyTotp} className="button-login">Verify</button>
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

export default SeconAuth;
