import axios from 'axios';

const API = axios.create({
    baseURL: 'https://localhost/api', 
    withCredentials: true, 
});

export default API;