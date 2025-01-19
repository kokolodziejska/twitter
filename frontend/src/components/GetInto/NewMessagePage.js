import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css"
import profilePicture from "../../assets/profile.png";
import LeftBar from "./organism/LeftBar";
import blueImage from "../../assets/blue.jpg";

function NewMessagePage(){
    const location = useLocation();
    const navigate = useNavigate();
    const usernameFromState = location.state?.userName || "";

    const handleNavigation = (path) => {
        navigate(path, { state: { userName: usernameFromState } });
    };

    return(<>
    <div className="main">
        <LeftBar
        profilePicture={profilePicture}
        username={usernameFromState}
        currentPage={"/new-message"}
        handleNavigation={handleNavigation}/>
       
        <div className="content-container ">
             <div
                                className="profile-bacground content-container-new-message"
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
                <div className="content-container-new-message-txt">
                    <h2 className="new-message-heading">Add New Post</h2>
                   
                    <form className="new-post-form" action="/submit-post" method="POST" enctype="multipart/form-data">
                        <label htmlFor="title">Title:</label>
                        <input className="new-message-form-input" type="text" id="title" name="title" placeholder="Add the title of the message" required />

                        <label  htmlFor="text">Text:</label>
                        <textarea className="new-message-form-input new-message-form-textarea" id="text" name="text" placeholder="Write your message here..." rows="5" required></textarea>
                        <h4 className="styling-text-description">Styling: use **text** to make text bolder</h4>

                        <label  htmlFor="picture">Picture:</label>
                        <input className="new-message-form-input new-message-form-input-picture" type="file" id="picture" name="picture" accept="image/*" />

                        <div className="new-message-generate-signiature-container">
                             <button className="form-button  new-message-generate-signiature" type="button" id="generate-signature">Generate Signature</button>
                        </div>
                        <button className="form-button  new-message-submit-button" type="submit">Post</button>
                    </form>

                  
                </div>
            </div>
        </div>
    </div>
    </>);
}

export default NewMessagePage