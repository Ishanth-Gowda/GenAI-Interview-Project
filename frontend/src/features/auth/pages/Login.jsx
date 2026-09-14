import React from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import '../auth.form.scss'
import { useState } from 'react'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault() // prevent the default form submission behavior, which would cause a page reload. Instead, we want to handle the form submission using JavaScript.
        setError("")
        try {
            await handleLogin({ email, password })
            navigate('/home')
        } catch (error) {
            setError(error.response?.data?.message || "Unable to log in. Please check your email and password.")
        }
    }

    if (loading) {
        return (<main className='auth-page loading-screen'><div className='loading-content'><span className='loading-spinner' /><h1>Loading...</h1></div></main>)
    }

    return (
        <main className='auth-page'>
            <div className='auth-layout'>
                <section className='auth-intro'>
                    <span className='auth-eyebrow'>Your Next Role Starts Here...</span>
                    <h1>Ace Your Interview with a Smarter Plan.</h1>
                    <p>The go-to interview plan and resume generator is here. Turn your experience into a strategy for your next big opportunity.</p>

                </section>
                <div className="form-container">
                    <h2>Login</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">Email:</label>
                            <input onChange={(e) => { setEmail(e.target.value) }} type="email" id='email' name='email' placeholder='Enter email' />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password:</label>
                            <input onChange={(e) => { setPassword(e.target.value) }} type="password" id='password' name='password' placeholder='Enter password' />
                        </div>

                        {error && <p className='auth-error' role='alert'>{error}</p>}

                        <button className='button primary-btn'>Login</button>
                    </form>
                    <p>Don't have an account? <Link to={'/register'}>Register here</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Login