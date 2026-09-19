import axios from 'axios';
// axios is like frontend's version of fetch API. It is used to make HTTP requests from the frontend to the backend server. It provides a simple and convenient way to send asynchronous HTTP requests and handle responses.

const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV
    ? "http://localhost:3000"
    : "https://genai-interview-project-wjeu.onrender.com")

const getAuthToken = () => localStorage.getItem('authToken')

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
    timeout: 8000
}) // here we are creating an instance of axios with a base URL, credentials, and a timeout to prevent requests from stalling the app for too long.

api.interceptors.request.use((config) => {
    const token = getAuthToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export const register = async ({ username, email, password }) => {
    const response = await api.post('/api/auth/register', {
        username, email, password
    })

    localStorage.setItem('authToken', response.data.token)
    return response.data
}

export const login = async ({ email, password }) => {
    const response = await api.post('/api/auth/login', {
        email, password
    })

    localStorage.setItem('authToken', response.data.token)
    return response.data
}

export const logout = async () => {
    try {
        const response = await api.get('/api/auth/logout')
        localStorage.removeItem('authToken')

        return response.data
    }
    catch (error) {
        localStorage.removeItem('authToken')
        console.log(error)
    }
}

export const getUserDetails = async () => {
    try {
        const response = await api.get('/api/auth/getUser')

        return response.data
    }
    catch (error) {
        console.log(error)
    }
}