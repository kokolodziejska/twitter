import "../../style/Register.css"
import { useLocation,Link, useNavigate } from "react-router-dom";
import blueImage from "../../assets/blue.jpg";
import React, { useState } from "react";
import API from "../configurations/api";
import zxcvbn from "zxcvbn";


function ChangePassword(){

    const location = useLocation();
    const usernameFromState = location.state?.userName || "";
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    // Stan dla każdego pola formularza
    const [formData, setFormData] = useState({
        password: "",
        repeatPassword: "",
    });

    // Stan błędów walidacji
  const [errors, setErrors] = useState({
        password: null,
        repeatPassword: null,
    });

    // Obsługa zmiany wartości pól
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    //sprawdzenie hasła
    const validatePassword = () => {
        const password = formData.password;
    
        // Warunki walidacji
        const minLength = 8;
        
        const hasUpperCase = /[A-Z]/.test(password); // Co najmniej jedna wielka litera
        const hasLowerCase = /[a-z]/.test(password); // Co najmniej jedna mała litera
        const hasNumber = /[0-9]/.test(password);    // Co najmniej jedna cyfra
        const hasSpecialChar = /[@#$%^&*(),.?":{}|<>!]/.test(password); // Co najmniej jeden znak specjalny
    
        // Sprawdzenie długości
        if (password.length < minLength ) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: `"Password must be at least ${minLength} characters long.`,
            }));
            return false;
        }
    
        // Sprawdzenie warunków
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
    
        // Jeśli wszystkie warunki są spełnione
        setErrors((prevErrors) => ({
            ...prevErrors,
            password: null, // Usuń błędy
        }));
        return true;
    };

    //sprawdzenie powtórzenia hasła
    const validateRepeatPassword = () => {
        const { password, repeatPassword } = formData;
    
        // Sprawdzenie czy hasła są identyczne
        if (password !== repeatPassword) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                repeatPassword: "Passwords do not match.",
            }));
            return false;
        }
    
        // Jeśli hasła są zgodne
        setErrors((prevErrors) => ({
            ...prevErrors,
            repeatPassword: null, // Usuń błędy
        }));
        return true;
    };


    const handleSubmit = async (e) => {
        e.preventDefault(); // Zapobiega odświeżeniu strony
    
        const isPasswordValid = validatePassword();
        const isRepeatPasswordValid = validateRepeatPassword();
    
        if (isPasswordValid && isRepeatPasswordValid) {
            try {
                console.log(formData);
    
                // Wysłanie danych do backendu
                const response = await API.post("/users/change-password", {
                    userName: usernameFromState, // Pobranie nazwy użytkownika ze stanu
                    newPassword: formData.password, // Przesłanie nowego hasła
                });
    
                if (response.status === 200) {
                    // Przejście na stronę logowania po zmianie hasła
                    navigate("/login", { state: { userName: usernameFromState } });
                }
            } catch (error) {
                console.error("Error changing password:", error);
    
                // Obsługa błędów serwera
                if (error.response && error.response.data && error.response.data.detail) {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        backend: error.response.data.detail, // Błąd zwrócony przez backend
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
    
        // Update the form data
        setFormData((prevData) => ({
            ...prevData,
            password,
        }));
    
        // Validate password (if required)
        validatePassword();
    
        // Check password strength using zxcvbn
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

export default ChangePassword