import React from 'react'
import { useNavigate, Link } from 'react-router'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

import '../auth.form.scss'

const Register = () => {

    const navigate = useNavigate(); // useNavigate returns a function to navigate from react router

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const { loading, handleRegister } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleRegister({ username, email, password })
        navigate('/home')
    }

    if (loading) {
        return (<main className='auth-page loading-screen'><div className='loading-content'><span className='loading-spinner' /><h1>Creating your account...</h1></div></main>)
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
                    <h2>Register</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="username">Username:</label>
                            <input onChange={(e) => { setUsername(e.target.value) }} type="text" id='username' name='username' placeholder='Enter username' />
                        </div>
                        <div className="input-group">
                            <label htmlFor="email">Email:</label>
                            <input onChange={(e) => { setEmail(e.target.value) }} type="email" id='email' name='email' placeholder='Enter email' />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Password:</label>
                            <input onChange={(e) => { setPassword(e.target.value) }} type="password" id='password' name='password' placeholder='Enter password' />
                        </div>

                        <button className='button primary-btn'>Register</button>
                    </form>
                    <p>Already have an account? <Link to={'/login'}>Login here</Link> </p>
                </div>
            </div>
        </main>
    )
}

export default Register