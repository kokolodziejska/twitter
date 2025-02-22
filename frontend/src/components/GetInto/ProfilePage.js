import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import blueImage from "../../assets/blue.jpg";
import profilePicture from "../../assets/profile.png";
import LeftBar from "./organism/LeftBar";
import API from "../configurations/api";

function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

function formatPublicKey(publicKey) {

    return publicKey
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .trim();
}

function ProfilePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [userName, setUserName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [pubKey, setpubKey] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                const userNameResponse = await API.get("/users/me");
                setUserName(userNameResponse.data.userName || "No username available"); 
    
                const phoneResponse = await API.get("/users/phone-me");  
                setPhone(phoneResponse.data.phone || "No phone available"); 
    
                const emailResponse = await API.get("/users/email-me");  
                setEmail(emailResponse.data.email || "No email available");
    
                const pubKeyResponse = await API.get("/users/pubKey-me");  
                const formattedKey = formatPublicKey(pubKeyResponse.data.publicKey || "No publicKey available");
                setpubKey(formattedKey);
    
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }
        fetchData();
    }, []);

    const handleNavigation =  (path) => {
        navigate(path);
    };
    const handleNavigationPassword = async (path) => {
        try{
            const num = generateSixDigitNumber()
            console.log({ email }, "-> Your code:", { num })

            await API.post("/users/set-mail-code", null, {
                params: { mail_code: num }
            });

            const doMain = true
            navigate("/seconauth-password", { state: {doMain: doMain} });

         }catch (error) {
            console.error("Error setting mail code:", error);
        }

    };

    return (
        <div className="main">
            <LeftBar
                profilePicture={profilePicture}
                currentPage={"/profile"}
                handleNavigation={handleNavigation}
            />
            <div className="content-container">
                <div
                    className="profile-bacground"
                    style={{
                        backgroundImage: `url(${blueImage})`,
                        backgroundSize: "cover",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                        width: "65vw",
                        height: "80vh",
                        borderRadius: "10vh",
                    }}
                >
                    <div>
                        <div className="profile-cointeinetr">
                            <div className="cointeinetr-picture-and-logo">
                                <div
                                    className="user-picture-big"
                                    style={{
                                        backgroundImage: `url(${profilePicture})`,
                                        backgroundSize: "cover",
                                        backgroundRepeat: "no-repeat",
                                        backgroundPosition: "center",
                                        width: "10.5vh",
                                        height: "10.5vh",
                                        borderRadius: "50%",
                                    }}
                                ></div>
                                <p className="user-name-big">{userName}</p>
                            </div>
                            <div className="user-informations">
                                <div className="personal-data-container">
                                    <p>Your email: </p>
                                    <p className="personal-data">{email}</p>
                                </div>

                                <div className="personal-data-container">
                                    <p> Your phone number: </p>
                                    <p className="personal-data" >{phone}</p>
                                </div>

                                <div className="decsription-container">
                                    <p className="profile-description-etyqiet">Your profile description:</p>
                                    <p className="profile-description-box"> ....... </p>
                                </div>
                            </div>
                            <div className="profile-edit-buttons">

                                <button className="profile-edit-button">Change profile picture</button>
                                <button className="profile-edit-button" onClick={() => handleNavigationPassword("/seconauth-password")}>Change password</button>
                            </div>
                            <div className="pub-key-container">
                                <p className="pub-key">Public key: {pubKey}</p>
                            </div>
                            <div className="profile-number-of-post-container">
                                <button className="profile-number-of-post-button" onClick={() => handleNavigation("/your-posts")}>Go to your posts</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
