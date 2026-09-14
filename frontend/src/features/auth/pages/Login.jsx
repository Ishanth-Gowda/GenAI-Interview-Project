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

    const handleSubmit = async (e) => {
        e.preventDefault() // prevent the default form submission behavior, which would cause a page reload. Instead, we want to handle the form submission using JavaScript.
        await handleLogin({ email, password })
        navigate('/home')
    }

    if (loading) {
        return (<main className='auth-page loading-screen'><div className='loading-content'><span className='loading-spinner' /><h1>Signing you in...</h1></div></main>)
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

                        <button className='button primary-btn'>Login</button>
                    </form>
                    <p>Don't have an account? <Link to={'/register'}>Register here</Link></p>
                </div>
            </div>
        </main>
    )
}

export default Login