import blueImage from "../../assets/blue.jpg";
import React, { useState, useEffect } from "react";
import { useLocation,Link, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import API from "../configurations/api";

function SeconAuth() {
    const location = useLocation();
    const navigate = useNavigate();

    const usernameFromState = location.state?.userName || "";
    const numFromState = location.state?.num || "";
    const [totpCode, setTotpCode] = useState("");
    const [error, setError] = useState("");
    const [qrCodeUrl, setQrCodeUrl] = useState(null);

    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                const userIdResponse = await API.get("/users/id", {
                    params: { username: usernameFromState },
                });
                const userId = userIdResponse.data;
        
                if (!userId) {
                    console.error("User ID not found for the given username.");
                    return;
                }

                const response = await API.post("/login/enable-totp", null, {
                    params: {
                        userId: userId  
                    },
                    responseType: 'blob'  
                });
                console.log("QR Code response:", response);

                const qrCodeUrl = URL.createObjectURL(response.data);
                setQrCodeUrl(qrCodeUrl);
            } catch (err) {
                console.error("Error generating QR code:", err);
                setError("Failed to generate QR code.");
            }
        };

        if (usernameFromState && !qrCodeUrl) {
            fetchQrCode();
        }
    }, [usernameFromState]);

    const handleVerifyTotp = async () => {
        try {
            // Przesyłamy userName i code jako parametry
            const response = await API.post("/login/verify-totp", null, {
                params: {
                    userName: usernameFromState,  // Przesyłamy userName w parametrze
                    code: parseInt(totpCode)     // Przesyłamy kod TOTP jako liczbę
                }
            });

            const { accessToken } = response.data;
            navigate("/Buzzly", { state: { userName: usernameFromState }});
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
                            type="number"
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
