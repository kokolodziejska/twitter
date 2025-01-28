import "../../style/Register.css";
import { Link, useNavigate } from "react-router-dom";
import blueImage from "../../assets/blue.jpg";
import React, { useState } from "react";
import API from "../configurations/api";

function generateSixDigitNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}

function ChangePasswordemail() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userName: "",
        email: "",
    });

    const [errors, setErrors] = useState({
        userName: null,
        email: null,
        global: null,
    });

    const validateUsername = async () => {
        const username = formData.userName;

        try {
            const response = await API.post("/users/check-username", { username });
            if (response.data.available) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userName: "User does not exist.",
                }));
                return false;
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userName: null,
                }));
                return true;
            }
        } catch (error) {
            console.error("Error checking username:", error);
            setErrors((prevErrors) => ({
                ...prevErrors,
                userName: "An error occurred while checking the username.",
            }));
            return false;
        }
    };

    const validateEmail = async () => {
        const { userName, email } = formData;

        try {
            const response = await API.post("/users/check-email-for-user", { userName, email });
            if (response.data.emailMatches) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: null,
                }));
                return true;
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: "Email does not match the user's record.",
                }));
                return false;
            }
        } catch (error) {
            console.error("Error checking email:", error);
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: "An error occurred while checking the email.",
            }));
            return false;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleLogin = async (event) => {
        event.preventDefault();
        console.log("tu")

        const isUsernameValid = await validateUsername();
        const isEmailValid = await validateEmail();

        if (isUsernameValid && isEmailValid) {
            console.log("tam")

            const email=formData.email
            const num = generateSixDigitNumber()
            console.log({email}, "-> Your code:", {num})

            navigate("/seconauth-password", { state: { userName: formData.userName, num: num } });
           
        }
    };

    return (
        <>
            <div className="login">
                <div className="login-left">
                    <h1 className="title">Buzzly</h1>
                    <div className="login-panel">
                        <h2 className="login-text">Change password</h2>
                        <form onSubmit={handleLogin} className="form-login">
                            <label htmlFor="userName">Username:</label>
                            <input
                                type="text"
                                placeholder="Your username"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                                onBlur={validateUsername}
                            />
                            {errors.userName && <p className="error-message-red">{errors.userName}</p>}

                            <label htmlFor="email">Email:</label>
                            <input
                                type="text"
                                placeholder="Your email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                onBlur={validateEmail}
                            />
                            {errors.email && <p className="error-message-red">{errors.email}</p>}

                            <button className="button-login" type="submit">
                                Send mail
                            </button>
                            {errors.global && <p className="error-message-red">{errors.global}</p>}
                        </form>
                        <Link to="/login" className="link-singup">
                            Login
                        </Link>
                    </div>
                </div>
                <div className="login-right">
                    <img src={blueImage} alt="Decorative" className="blue-picture" />
                </div>
            </div>
        </>
    );
}

export default ChangePasswordemail;
