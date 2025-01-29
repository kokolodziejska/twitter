import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../style/Main.css";
import profilePicture from "../../assets/profile.png";
import LeftBar from "./organism/LeftBar";
import blueImage from "../../assets/blue.jpg";
import API from "../configurations/api";
import ReactMarkdown from "react-markdown";

function NewMessagePage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [successMessage, setSuccessMessage] = useState("");
    const [doSign, setDoSign] = useState(false);

    const [formData, setFormData] = useState({
        message: "",
        picture: "", 
    });

    const [errors, setErrors] = useState({
        message: null,
        picture: null,
    });

    const validateMessage = () => {
        const message = formData.message;

        if (message.length < 3 || message.length > 1000) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                message: "Message must be between 3 and 1000 characters.",
            }));
            return false;
        }

        setErrors((prevErrors) => ({ ...prevErrors, message: null }));
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleGenerateSignature = () => {
        setDoSign(!doSign);
    };


    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setFormData((prevData) => ({
                ...prevData,
                picture: null,
            }));
            setErrors((prevErrors) => ({
                ...prevErrors,
                picture: null,
            }));
            return;
        }

        if (!['image/jpeg', 'image/png'].includes(file.type)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                picture: "Only JPEG and PNG images are allowed.",
            }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                picture: "File size exceeds the 5MB limit.",
            }));
            return;
        }

        const reader = new FileReader(); 
        reader.onload = () => {
            setFormData((prevData) => ({
                ...prevData,
                picture: reader.result.split(",")[1], 
            }));
        };
        reader.onerror = (error) => {
            console.error("Error reading file:", error);
            setErrors((prevErrors) => ({
                ...prevErrors,
                picture: "Error reading file.",
            }));
        };
        reader.readAsDataURL(file);
    };


    const handleNavigation = (path) => {
        navigate(path);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const isMessageValid = validateMessage();
        if (!isMessageValid) {
            console.warn("Message validation failed.");
            return;
        }
    
        try {
            const payload = {
                message: formData.message,
                image: formData.picture || null, 
                doSign: doSign,
            };
    
            console.log("Payload being sent to API:", payload);
    
            const messageResponse = await API.post("/messages/add", payload);
            console.log("Response from API:", messageResponse.data);
    
            setFormData({
                message: "",
                picture: "",
            });
    
            setSuccessMessage("Post has been successfully sent!");
            setTimeout(() => setSuccessMessage(""), 5000); 
        } catch (error) {
            console.error("Error occurred:", error.response?.data || error.message);
    
            if (error.response) {
                console.error("Server response:", error.response);
            }
        }
    };
    


    return (
        <div className="main">
            <LeftBar
                profilePicture={profilePicture}
                currentPage={"/new-message"}
                handleNavigation={handleNavigation}
            />

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

                        <form className="new-post-form" onSubmit={handleSubmit}>
                            <label htmlFor="text">Message:</label>
                            <textarea
                                className="new-message-form-input new-message-form-textarea"
                                name="message"
                                placeholder="Write your message here..."
                                value={formData.message}
                                onChange={handleChange}
                                onBlur={validateMessage}
                                rows="6"
                                required
                            ></textarea>
                            {errors.message && <p className="error-message">{errors.message}</p>}

                            <label htmlFor="picture">Picture:</label>
                            <input
                                className="new-message-form-input new-message-form-input-picture"
                                type="file"
                                id="picture"
                                name="picture"
                                accept="image/*"
                                placeholder="Select your picture"
                                onChange={handleImageUpload}
                            />

                            <div className="new-message-generate-signiature-container">
                                <button
                                    className="form-button  new-message-generate-signiature"
                                    type="button"
                                    id="generate-signature"
                                    onClick={handleGenerateSignature}
                                >
                                    Generate Signature
                                </button>
                            </div>
                            <div>
                                <button className="form-button  new-message-submit-button" type="submit">
                                    Post
                                </button>
                                {successMessage && <p className="success-message">{successMessage}</p>}
                            </div>



                        </form>
                        <div className="markdown-info">

                            <div className="styling-instruction">
                                <h3 className="header-styling"> Markdown Styling Instructions</h3>
                                <div className="styling-instruction-container">
                                    <div className="text-styling">
                                        <p className="section">Text Styling</p>

                                        <div className="instruction">
                                            <p>**bold text**</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-bold-result">bold text</p>
                                        </div>
                                        <div className="instruction">
                                            <p>*italic text*</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-italic-result">italic text</p>
                                        </div>
                                        <div className="instruction">
                                            <p>***bold and italic***</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-bold-italic-result"> bold and italic</p>
                                        </div>

                                    </div>
                                    <div className="text-styling">
                                        <p className="section"> Lists</p>
                                        <p className="small-header">Unordered List</p>
                                        <div className="instruction">
                                            <div>
                                                <p>- Item a</p>
                                                <p>- Item b</p>
                                            </div>
                                            <div>
                                                <p className="arrow">→ </p>
                                            </div>
                                            <div>
                                                <li> Item a</li>
                                                <li> Item b</li>
                                            </div>
                                        </div>
                                        <p className="small-header">Ordered List</p>
                                        <div className="instruction">
                                            <div>
                                                <p>1. Item a</p>
                                                <p>2. Item b</p>
                                            </div>
                                            <div>
                                                <p className="arrow">→ </p>
                                            </div>
                                            <ol>
                                                <li> Item a</li>
                                                <li> Item b</li>
                                            </ol>
                                        </div>
                                    </div>



                                    <div className="text-styling ">
                                        <p className="section">Colors</p>

                                        <div className="instruction instruction-color">
                                            <p>[orange]Orange text[/orange]</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-orange-result">Orange text</p>
                                        </div>

                                        <div className="instruction instruction-color">
                                            <p>[red]Red text[/red]</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-red-result">Red text</p>
                                        </div>

                                        <div className="instruction instruction-color">
                                            <p>[green]Green text[/green]</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-green-result">Green text</p>
                                        </div>

                                        <div className="instruction instruction-color">
                                            <p>[blue]Blue text[/blue]</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-blue-result">Blue text</p>
                                        </div>

                                        <div className="instruction instruction-color">
                                            <p>[purple]Purple text[/purple]</p>
                                            <p className="arrow">→ </p>
                                            <p className="markdown-purple-result">Purple text</p>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewMessagePage;
