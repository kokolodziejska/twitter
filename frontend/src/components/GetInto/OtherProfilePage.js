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

function OtherProfilePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const usernameFromState = location.state?.userName || "";

    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [pubKey, setpubKey] = useState("");
    const [profilePic, setProfilePic] = useState(profilePicture);

    useEffect(() => {
        async function fetchData() {
            try {
                console.log("Fetching data for username:", usernameFromState);

                const phoneResponse = await API.post("/users/phone", { userName: usernameFromState });
                setPhone(phoneResponse.data.phone || "No phone available"); 

                const emailResponse = await API.post("/users/email", { userName: usernameFromState });
                setEmail(emailResponse.data.email || "No email available");

                const pubKeyResponse = await API.post("/users/pubKey", { userName: usernameFromState });
                const formattedKey = formatPublicKey(pubKeyResponse.data.publicKey || "No publicKey available");
                setpubKey(formattedKey);

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }

        fetchData();
    }, []);

    const handleNavigation = (path) => {
        navigate(path);
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
                                <p className="user-name-big">{usernameFromState}</p>
                            </div>
                            <div className="user-informations">
                                <div className="personal-data-container">
                                    <p>Email: </p>
                                    <p className="personal-data">{email}</p>
                                </div>

                                <div className="personal-data-container">
                                    <p> Phone number: </p>
                                    <p className="personal-data" >{phone}</p>
                                </div>

                                <div className="decsription-container">
                                    <p className="profile-description-etyqiet">Profile description:</p>
                                    <p className="profile-description-box"> ....... </p>
                                </div>
                            </div>
                            <div className="profile-edit-buttons">
                            </div>
                            <div className="pub-key-container">
                                <p className="pub-key">Public key: {pubKey}</p>
                            </div>
                             <div className="profile-number-of-post-container">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OtherProfilePage;
