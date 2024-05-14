import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Assuming 401 means token expired
            localStorage.removeItem('userToken');  // Optional: Clear the stored token
            window.location.href = '/signin';  // Redirect to the sign-in page
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;