import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import profilePicture from "../../assets/profile.png";
import LeftBar from "./organism/LeftBar";
import API from "../configurations/api";

function parseMessage(message) {
    // Escapowanie znaków HTML
    const escapedMessage = message
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Zamiana znaczników kolorów na klasy CSS
    const coloredMessage = escapedMessage
    .replace(/\[red\](.*?)\[\/red\]/g, '<span class="text-red">$1</span>')
    .replace(/\[green\](.*?)\[\/green\]/g, '<span class="text-green">$1</span>')
    .replace(/\[blue\](.*?)\[\/blue\]/g, '<span class="text-blue">$1</span>')
    .replace(/\[orange\](.*?)\[\/orange\]/g, '<span class="text-orange">$1</span>') 
    .replace(/\[purple\](.*?)\[\/purple\]/g, '<span class="text-purple">$1</span>'); 


    // Obsługa list punktowanych i numerowanych
    const listMessage = coloredMessage
        // Listy numerowane: znajdź wszystkie grupy numerowanych pozycji i otocz je <ol>
        .replace(/(\d+\..*?(\n|$))+/g, (match) => {
            const items = match
                .trim()
                .split("\n")
                .map((item) => item.replace(/^\d+\.\s*/, '<li>') + "</li>")
                .join("");
            return `<ol>${items}</ol>`;
        })
        // Listy punktowane: znajdź wszystkie grupy punktowanych pozycji i otocz je <ul>
        .replace(/(- .*?(\n|$))+/g, (match) => {
            const items = match
                .trim()
                .split("\n")
                .map((item) => item.replace(/^- /, '<li>') + "</li>")
                .join("");
            return `<ul>${items}</ul>`;
        });

    // Zamiana znaczników Markdown na HTML
    const formattedMessage = listMessage
        .replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>') // ***bold and italic***
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')           // **bold**
        .replace(/\*(.*?)\*/g, '<i>$1</i>')               // *italic*
        .replace(/\n/g, '<br>');                         // Nowe linie

    return formattedMessage;
}



function MainPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const usernameFromState = location.state?.userName || "";

    const [messages, setMessages] = useState([]);

    const handleNavigation = (path) => {
        navigate(path, { state: { userName: usernameFromState } });
    };

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await API.get("/messages");
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error.response?.data || error.message);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="main">
            <LeftBar
                profilePicture={profilePicture}
                username={usernameFromState}
                currentPage={"/Buzzly"}
                handleNavigation={handleNavigation}
            />
            <div className="content-container">
                <div className="messages-container">
                    {messages.map((msg) => (
                        <div className="message-bubble" key={msg.id}>
                            <div className="message-header">
                                <strong>{msg.userName}</strong>
                                <span className="message-date">
                                    {new Date(msg.date).toLocaleString()}
                                </span>
                            </div>
                            {/* Renderowanie wiadomości z kolorami */}
                            <div
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
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MainPage;
