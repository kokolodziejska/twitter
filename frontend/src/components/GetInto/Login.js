import blueImage from "../../assets/blue.jpg";
import API from "../configurations/api";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";


function Login() {

    const location = useLocation();
    const navigate = useNavigate();
    const usernameFromState = location.state?.userName || "";

    const [formData, setFormData] = useState({
        userName: "", 
        password: "",
        
    });

    const [errors, setErrors] = useState({
        userName: null,
        password: null,
        global: null, 
    });

    useEffect(() => {
        if (usernameFromState) {
            setFormData((prevData) => ({
                ...prevData,
                userName: usernameFromState,
            }));
        }
    }, [usernameFromState]);

    const validateUsername = async (e) => {
        const username = formData.userName;
    
        try {
            const response = await API.post("/users/check-username", { username: username,});
            if (response.data.available) {
              
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userName: "User does not exist.",
                }));
            } else {
             
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userName: null,
                }));
            }
        } catch (error) {
            console.error(error.response?.data || "An error occurred");
            setErrors((prevErrors) => ({
                ...prevErrors,
                userName: "An error occurred while checking the username.",
            }));
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
    
        try {
            const response = await API.post("/login/", {
                userName: formData.userName,
                password: formData.password,
            });
            console.log(response.data);

            
            sessionStorage.setItem("tempToken", response.data.tempToken);

            setErrors((prevErrors) => ({
                ...prevErrors,
                password: null, 
            }));
            navigate("/seconauth");
            console.log("Login successful!");
        } catch (error) {
            console.error(error.response?.data || "An error occurred");
            if (error.response?.status === 404) {
                
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userName: error.response.data.detail,
                }));
            } else if (error.response?.status === 401) {
                
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    password: error.response.data.detail, 
                }));
            }else if (error.response?.status === 403) {
                    
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        global: error.response.data.detail,
                }));
            } else {
                
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userName: "An unexpected error occurred. Please try again.",
                }));
            }
        }
    };
    

    return (
        <>
        <div className="login">
            <div className="login-left">
                <h1 className="title">Buzzly</h1>
                <div className="login-panel">
                    <h2 className="login-text">Login</h2>
                    <p className="welcome">Welcome back, please login to your account.</p>
                    <form onSubmit={handleLogin} className="form-login">
                        <label htmlFor="userName">Username:</label>
                        <input
                            type="text"
                            placeholder='user123'
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                            onBlur={validateUsername}
                        />
                        {errors.userName && <p className="error-message-red">{errors.userName}</p>}

                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="*****"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {errors.password && <p className="error-message-red">{errors.password}</p>}

                        <button className="button-login" type="submit">
                            Log in
                        </button>
                        {errors.global && <p className="error-message-red error-message-red-2">{errors.global}</p>}
                    </form>
                    <Link to="/new-password-email" className="forgot-password">
                    Forgot your password?
                    </Link>
                    <p className="dont-have">Don't have an account?</p>
                    <Link to="/signup" className="link-singup">
                        Sign up
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

export default Login;
