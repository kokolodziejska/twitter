import React, { useEffect, useState } from 'react';
import API from './components/configurations/api.js';
import Login from './components/GetInto/Login.js';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './style/App.css';
import SignUp from './components/GetInto/SignUp.js';
import WelcomePage from './components/GetInto/WelcomePage.js';
import MainPage from './components/GetInto/MainPage.js';
import ProfilePage from './components/GetInto/ProfilePage.js';
import NewMessagePage from './components/GetInto/NewMessagePage.js';
import UserPostsPage from './components/GetInto/UserPostsPage.js';
import SeconAuth from './components/GetInto/SecondAuth.js';
import ChangePassword from './components/GetInto/ChangePassword.js';
import ChangePasswordemail from './components/GetInto/ChangePasswordemail.js';
import SeconAuthPassword from './components/GetInto/SecondAuthPassword.js';
import ChangePasswordMain from './components/GetInto/ChangePasswordToMain.js';
import OtherProfilePage from './components/GetInto/OtherProfilePage.js';


function App() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        API.get('/')
            .then((response) => {
                setMessage(response.data.message);
            })
            .catch((error) => {
                console.error('Error fetching message:', error);
            });
    }, []);

    return (
        <div>
            <Router>
                <div>
                    
                    <Routes>
                    
                    <Route path="/" element={<Navigate to="/login" />}/>
                    <Route path="/login" element={<Login />} />
                    <Route path="/seconauth" element={<SeconAuth />} />
                    <Route path="/seconauth-password" element={<SeconAuthPassword/>}/>
                    <Route path="/new-password-email" element={<ChangePasswordemail/>}/>
                    <Route path='/new-password' element={<ChangePassword/>}/>
                    <Route path='/new-password-user' element={<ChangePasswordMain/>}/>
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/Buzzly" element={<MainPage />} />
                    <Route path='/profile' element={<ProfilePage/>} />
                    <Route path='/new-message' element={<NewMessagePage/>} />
                    <Route path='/your-posts' element={<UserPostsPage/>}/>
                    <Route path='/profile-other' element={<OtherProfilePage/>}/>
                    </Routes>
                </div>
            </Router>
            
        </div>
    );
}

export default App;

