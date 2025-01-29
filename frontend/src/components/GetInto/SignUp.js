import "../../style/Register.css"
import { Link, useNavigate } from 'react-router-dom';
import blueImage from "../../assets/blue.jpg";
import React, { useState } from "react";
import API from "../configurations/api";
import zxcvbn from "zxcvbn";


function SignUp(){

    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    // Stan dla każdego pola formularza
    const [formData, setFormData] = useState({
        userName: "",
        email: "",
        phoneNumber: "",
        password: "",
        repeatPassword: "",
    });

    // Stan błędów walidacji
  const [errors, setErrors] = useState({
        userName: null,
        email: null,
        phoneNumber: null,
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

  
    const validateUsername = async () => {

        const username = formData.userName; 
        
        if (username.length < 3 || username.length > 30) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            userName: "Username must be between 3 and 30 characters.", 
          }));
          return false;
        }
      

        try {
            const response = await API.post("/users/check-username", {
                username: username,
            });
    
            if (response.data.available) {
                setErrors((prevErrors) => ({ ...prevErrors, userName: null }));
                return true;
            } else {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    userName: "This username is already taken!",
                }));
                return false;
            }
        } catch (error) {
            console.error("Error checking username availability:", error);
            setErrors((prevErrors) => ({
                ...prevErrors,
                userName: "Error checking username availability.",
            }));
            return false;
        }
      };
    

 
    const validateEmail = async () => {
        const email = formData.email; 
     
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: "Invalid email format.",
            }));
            return false;
        }
        
      
        try {
            const response = await API.post("/users/check-email", { email: email});
            if (!response.data.available) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    email: "This email address is already registered.", 
                }));
                return false;
            }
         
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: null,
            }));
            return true;
        } catch (error) {
            console.error("Error checking email availability:", error);
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: "Could not verify email availability. Try again later.", 
            }));
            return false;
        }
    };

    const validatePhone = async () => {
        const phoneNumber = formData.phoneNumber;
    
        
        const phoneRegex = /^[0-9\s\+\-\(\)]*$/; 
        if (!phoneRegex.test(phoneNumber)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                phoneNumber: "Phone number contains invalid characters.",
            }));
            return false;
        }
    
       
        const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");
    
        
        if (cleanPhoneNumber.length < 9 || cleanPhoneNumber.length > 15) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                phoneNumber: "Phone number must contain between 9 and 15 digits.",
            }));
            return false;
        }
    
        
        try {
            const response = await API.post("/users/check-phone-number", { phone_number: cleanPhoneNumber });
            if (!response.data.available) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    phoneNumber: "This phone number is already registered.",
                }));
                return false;
            }
            setErrors((prevErrors) => ({
                ...prevErrors,
                phoneNumber: null,
            }));
            return true;
        } catch (error) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                phoneNumber: "Could not verify phone number availability. Try again later.",
            }));
            console.error(error);
            return false;
        }
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
        
        const isUsernameValid = await validateUsername();
        const isPhoneValid = await validatePhone();
        const isEmailValid = await validateEmail();
        const isPasswordValid = validatePassword();
        const isRepeatPasswordValid = validateRepeatPassword();
    
        if (isUsernameValid && isPhoneValid && isEmailValid && isPasswordValid && isRepeatPasswordValid) {
            try {
                console.log(formData)
                
                const response = await API.post("/users/add", {
                    userName: formData.userName,
                    password: formData.password,
                    phone: formData.phoneNumber,
                    email: formData.email,
                });
    
                if (response.status === 200) {
                    
                    navigate("/welcome", { state: { userName: formData.userName } });
                }
            } catch (error) {
                console.error("Error registering user:", error);
    
                
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
        
        
        <h1 className="title-register">Buzzly</h1>
            <div className="register-panel">
                <p className="sing-up">Sign up</p>
                <div className="line"></div>
                <form className="form" onSubmit={handleSubmit}>
                    
                    <label>UserName</label>
                    <input type="text"
                            placeholder='Your Username'
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                            onBlur={validateUsername}></input>
                    {errors.userName && (
                            <p className="error-message">{errors.userName}</p>)}
                    
                    <label>Email</label>
                    <input type="email"
                            placeholder='Your e-mail addres'
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            onBlur={validateEmail} ></input>
                    {errors.email && <p className="error-message">{errors.email}</p>}
                    
                    <label>Phone number</label>
                    <input type="tel"
                            placeholder='Your phone number'
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            onBlur={validatePhone}></input>
                    {errors.phoneNumber && <p className="error-message">{errors.phoneNumber}</p>}
                    
                    
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
                    
                    <button className="button-singUp" type="submit">Sing up</button>

                </form>
            
            </div>
        <div className="back-to-login">
                <p className="already">Already a member?</p>
                <Link to="/login" className="sign-in">Sign in</Link>
        </div>

        </div>
        <div className="picure">
            <img src={blueImage} alt="Decorative" className='blue-picture-register'/>

        </div>

    </div>
    
    </>);
}

export default SignUp