import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import profilePicture from "../../assets/profile.png";
import LeftBar from "./organism/LeftBar";
import API from "../configurations/api";
import bacground from "../../assets/1.jpg";

function parseMessage(message) {
    
    const escapedMessage = message
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

 
    const coloredMessage = escapedMessage
        .replace(/\[red\](.*?)\[\/red\]/g, '<span class="text-red">$1</span>')
        .replace(/\[green\](.*?)\[\/green\]/g, '<span class="text-green">$1</span>')
        .replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="text-blue">$1</span>')
        .replace(/\[orange\](.*?)\[\/orange\]/g, '<span class="text-orange">$1</span>')
        .replace(/\[purple\](.*?)\[\/purple\]/g, '<span class="text-purple">$1</span>');


    const listMessage = coloredMessage
        
        .replace(/(\d+\..*?(\n|$))+/g, (match) => {
            const items = match
                .trim()
                .split("\n")
                .map((item) => item.replace(/^\d+\.\s*/, '<li>') + "</li>")
                .join("");
            return `<ol>${items}</ol>`;
        })
        
        .replace(/(- .*?(\n|$))+/g, (match) => {
            const items = match
                .trim()
                .split("\n")
                .map((item) => item.replace(/^- /, '<li>') + "</li>")
                .join("");
            return `<ul>${items}</ul>`;
        });

    
    const formattedMessage = listMessage
        .replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>') 
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')           
        .replace(/\*(.*?)\*/g, '<i>$1</i>')               
        .replace(/\n/g, '<br>');                         

    return formattedMessage;
}

function MainPage() {
    const navigate = useNavigate();


    const [messages, setMessages] = useState([]);

    const handleNavigation = (path) => {
        navigate(path);
    };
  

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await API.get("/messages/messages");
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error.response?.data || error.message);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 30000);
        return () => clearInterval(interval);
    }, []);


    const toggleSignature = (id, isHovered) => {
        setMessages((prevMessages) =>
            prevMessages.map((msg) =>
                msg.id === id && msg.signature
                    ? { ...msg, showFullSignature: isHovered }
                    : msg
            )
        );
    };
    
    return (
        <div className="main">
            <LeftBar
                profilePicture={profilePicture}
                currentPage={"/Buzzly"}
                handleNavigation={handleNavigation}
            />
            <div className="content-container" style={{
                backgroundImage: `url(${bacground})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }}>
                <div className="messages-container">
                    {messages.map((msg) => (
                        <div className="message-bubble" key={msg.id}>
                            <div className="message-header">
                                <button className="message-username" onClick={() =>  navigate("/profile-other", { state: { userName: msg.userName} })}>{msg.userName}</button>
                                <span className="message-date">
                                    {new Date(msg.date).toLocaleString()}
                                </span>
                            </div>

                            <div
                                className="message"
                                dangerouslySetInnerHTML={{
                                    __html: parseMessage(msg.message),
                                }}
                            />
                            {msg.image && (
                                <img
                                    src={`data:image/*;base64,${msg.image}`}
                                    alt="Attached"
                                    className="message-image"
                                />
                            )}
                            <p
                                className="message-signature-wrapper"
                                onMouseEnter={() => msg.signature && toggleSignature(msg.id, true)}
                                onMouseLeave={() => msg.signature && toggleSignature(msg.id, false)}
                            >
                                
                                {msg.signature ? (
                                    msg.showFullSignature ? (<>
                                        <span className="signature-collapsed">Signature: </span>
                                        <span className="signature-expanded">{msg.signature}</span></>
                                    ) : (
                                        
                                        <span className="signature-collapsed">Signature: {msg.signature}</span>
                                    )
                                ) : (
                                    <span className="no-signature">No signature</span>
                                )}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MainPage;
