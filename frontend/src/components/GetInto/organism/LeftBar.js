import API from '../../configurations/api'; 
import React, { useState, useEffect } from "react";

const LeftBar = ({ profilePicture, currentPage, handleNavigation }) => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userIdResponse = await API.get("/users/me");
        setUsername(userIdResponse.data.userName); 
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUsername();
  }, []); 

  return (
    <div className="left-bar">
      <h1 className="title-main">Buzzly</h1>
      <div className="user">
        <div
          className="user-picture"
          style={{
            backgroundImage: `url(${profilePicture})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            width: "5.5vh",
            height: "5.5vh",
            borderRadius: "50%",
          }}
        ></div>
        <p className="user-name">{username}</p>
      </div>

      <div className="sidebar">
        <button
          className={`sidebar-button ${currentPage === "/Buzzly" ? "selected-button" : ""}`}
          onClick={() => handleNavigation("/Buzzly")}
        >
          <span className="material-icons">forum</span> Buzze
        </button>
        <button
          className={`sidebar-button ${currentPage === "/new-message" ? "selected-button" : ""}`}
          onClick={() => handleNavigation("/new-message")}
        >
          <span className="material-icons">add_comment</span>New Post
        </button>
        <button
          className={`sidebar-button ${currentPage === "/your-posts" ? "selected-button" : ""}`}
          onClick={() => handleNavigation("/your-posts")}
        >
          <span className="material-icons">list</span> Your Posts
        </button>
        <button
          className={`sidebar-button ${currentPage === "/edit-profile" ? "selected-button" : ""}`}
          onClick={() => handleNavigation("/profile")}
        >
          <span className="material-icons">account_box</span> Edit Profile
        </button>
      </div>

      <button className="log-out" onClick={() => handleNavigation("/login")}>
        Log out
      </button>
    </div>
  );
};

export default LeftBar;
