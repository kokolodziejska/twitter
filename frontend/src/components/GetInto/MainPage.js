import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css"
import profilePicture from "../../assets/profile.png";

function MainPage(){
    const location = useLocation();
    const navigate = useNavigate();
    const usernameFromState = location.state?.userName || "";

    const handleNavigation = (path) => {
        navigate(path, { state: { userName: usernameFromState } });
    };

    return(<>
    <div className="main">
        <div className="left-bar">
        <h1 className="title-main">Buzzly</h1>
            <div className="user">
                            <div className="user-picture"style={{backgroundImage: `url(${profilePicture})`,backgroundSize: 'cover',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        width: '5.5vh', 
                                        height: '5.5vh',borderRadius: '50%' }}></div>
                            <p className="user-name">{usernameFromState}</p>
            </div>

            <div class="sidebar">
                <button className="sidebar-button selected-button " onclick="">Buzze</button>
                <button className="sidebar-button" onClick={() => handleNavigation("/new-message")}>New Post</button>
                <button className="sidebar-button" onClick={() => handleNavigation("/your-posts")}>Your Posts</button>
                <button className="sidebar-button"  onClick={() => handleNavigation("/profile")}>Profile</button>
            </div>

            <button className="log-out" onClick={() => handleNavigation("/login")}> Log out</button>

        
        </div>
        <div className="content-container">
        
        </div>
    </div>
    </>);
}

export default MainPage