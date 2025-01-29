import "../../style/Register.css"
import { useLocation,Link, useNavigate } from "react-router-dom";
import blueImage from "../../assets/blue.jpg";
import React, { useState } from "react";
import API from "../configurations/api";
import zxcvbn from "zxcvbn";


function ChangePasswordMain(){

    const location = useLocation();
    const usernameFromState = location.state?.userName || "";
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: "",
        repeatPassword: "",
    });

  const [errors, setErrors] = useState({
        password: null,
        repeatPassword: null,
    });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const validatePassword = () => {
        const password = formData.password;
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password); 
        const hasLowerCase = /[a-z]/.test(password); 
        const hasNumber = /[0-9]/.test(password);    
        const hasSpecialChar = /[@#$%^&*(),.?":{}|<>!]/.test(password); 
    
        if (password.length < minLength ) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: `"Password must be at least ${minLength} characters long.`,
            }));
            return false;
        }
    
        if (!hasUpperCase) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: "Password must contain at least one uppercase letter!",
            }));
            return false;
        }
        if (!hasLowerCase) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: "Password must contain at least one lowercase letter!",
            }));
            return false;
        }
        if (!hasNumber) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: "Password must contain at least one number!",
            }));
            return false;
        }
        if (!hasSpecialChar) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: "Password must contain at least one special character!",
            }));
            return false;
        }
    
        setErrors((prevErrors) => ({
            ...prevErrors,
            password: null, 
        }));
        return true;
    };

    const validateRepeatPassword = () => {
        const { password, repeatPassword } = formData;
    
        if (password !== repeatPassword) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                repeatPassword: "Passwords do not match.",
            }));
            return false;
        }
    
        setErrors((prevErrors) => ({
            ...prevErrors,
            repeatPassword: null, 
        }));
        return true;
    };


    const handleSubmit = async (e) => {
        e.preventDefault(); 
    
        const isPasswordValid = validatePassword();
        const isRepeatPasswordValid = validateRepeatPassword();
    
        if (isPasswordValid && isRepeatPasswordValid) {
            try {
                const response = await API.post("/users/change-password", {
                    userName: usernameFromState, 
                    newPassword: formData.password, 
                });
    
                if (response.status === 200) {
                    
                    navigate("/profile", { state: { userName: usernameFromState } });
                }
            } catch (error) {
                console.error("Error changing password:", error);
    
              
                if (error.response && error.response.data && error.response.data.detail) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        backend: error.response.data.detail, 
                    }));
                } else {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        backend: "An unexpected error occurred. Please try again later.",
                    }));
                }
            }
        }
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
    
        setFormData((prevData) => ({
            ...prevData,
            password,
        }));
    
        validatePassword();
    
        const strength = zxcvbn(password);
        setPasswordStrength(strength.score); 
        
    };

    return(
    <>
    <div className="reister-container">
        <div className="signUp-contaner">
        
        
        <h1 className="title">Buzzly</h1>
            <div className="register-panel">
                <p className="change-password-text">{usernameFromState} you can change your password!</p>
                
                <form className="form" onSubmit={handleSubmit}>
                     <label>Password</label>
                    <input type="password"
                            placeholder='Your password'
                            name="password"
                            value={formData.password}
                            onChange={handlePasswordChange} 
                            required
                            onBlur={validatePassword}></input>
                    <p className="requirements-password">Use one: small and big characters, numbers, special symbols, minimum length 8 symbols</p>
                    {errors.password && <p className="error-message">{errors.password}</p>}
                   
                    {formData.password && (
                        <div className="password-strength-container">
                            <div className="strength-bar-wrapper">
                                <div
                                    className={`strength-bar strength-${passwordStrength}`}
                                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                                ></div>
                            </div>
                            <span className="strength-text">
                                {passwordStrength === 0 && "Too weak"}
                                {passwordStrength === 1 && "Weak"}
                                {passwordStrength === 2 && "Fair"}
                                {passwordStrength === 3 && "Strong"}
                                {passwordStrength === 4 && "Very strong"}
                            </span>
                        </div>
                    )}
                    
                 
                    <label>Repeat Password</label>
                    <input type="password"
                            placeholder='Reapet your password'
                            name="repeatPassword"
                            value={formData.repeatPassword}
                            onChange={handleChange}
                            required
                            onBlur={validateRepeatPassword}></input>
                    {errors.repeatPassword && <p className="error-message">{errors.repeatPassword}</p>}
                    
                    <button className="button-singUp" type="submit">Change Password</button>

                </form>
            
            </div>
        <div className="back-to-login">
                <Link to="/login" className="sign-in">Sign in</Link>
        </div>

        </div>
        <div className="picure">
            <img src={blueImage} alt="Decorative" className='blue-picture-register'/>

        </div>

    </div>
    
    </>);
}

export default ChangePasswordMain