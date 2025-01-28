import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import blueImage from "../../assets/blue.jpg";
import profilePicture from "../../assets/profile.png";
import LeftBar from "./organism/LeftBar";
import API from "../configurations/api";




function formatPublicKey(publicKey) {

    return publicKey
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .trim();
}

function ProfilePage() {
    const location = useLocation();
    const navigate = useNavigate();
    const usernameFromState = location.state?.userName || "";

    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [pubKey, setpubKey] = useState("");

    useEffect(() => {
        async function fetchData() {
            try {
                console.log("Fetching data for username:", usernameFromState);

                const phoneResponse = await API.post("/users/phone", { userName: usernameFromState });
                console.log("Phone API response:", phoneResponse.data);
                setPhone(phoneResponse.data.phone || "No phone available"); // Użyj właściwego klucza

                const emailResponse = await API.post("/users/email", { userName: usernameFromState });
                console.log("Email API response:", emailResponse.data);
                setEmail(emailResponse.data.email || "No email available");

                const pubKeyResponse = await API.post("/users/pubKey", { userName: usernameFromState });
                console.log("PubKey API response:", pubKeyResponse.data);
                const formattedKey = formatPublicKey(pubKeyResponse.data.publicKey || "No publicKey available");
                setpubKey(formattedKey);

            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        }

        fetchData();
    }, []);


    const handleNavigation = (path) => {
        navigate(path, { state: { userName: usernameFromState } });
    };
    const handleNavigationPassword = (path) => {
        
        navigate(path, { state: { userName: usernameFromState} });
    };

    return (
        <div className="main">
            <LeftBar
                profilePicture={profilePicture}
                username={usernameFromState}
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

                                <button className="profile-edit-button">Edit your description</button>
                                <button className="profile-edit-button">Change profile picture</button>
                                <button className="profile-edit-button" onClick={() => handleNavigationPassword("/new-password")}>Change password</button>
                            </div>
                            <div className="pub-key-container">
                                <p className="pub-key">Public key: {pubKey}</p>
                            </div>
                            <div className="profile-number-of-post-container">
                                <div className="profile-number-of-post-number-container">
                                    <p className="profile-number-of-post">Number of your post: </p>
                                    <p className="profile-number-of-post profile-number-of-post-number">20</p>
                                </div>


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
