import { useContext, useEffect } from "react";
import { authContext } from "../auth.context.jsx";
import { register, login, logout, getUserDetails } from '../services/auth.api.js'

export const useAuth = () => {
    const context = useContext(authContext)
    const { user, setUser, loading, isLoading } = context

    // this hook is to manage state and api calls related to authentication. It provides functions for registering, logging in, logging out, and getting user details. It also manages the user state and loading state.
    // mainly to maintain the flow of authentication while logging in, registering, logging out, and getting user details.


    const handleRegister = async ({ username, email, password }) => {
        isLoading(true)
        try {
            const data = await register({ username, email, password })
            setUser(data.user)
        }
        catch (error) {
            setUser(null)
            throw error
        }
        finally {
            isLoading(false)
        }
    }


    const handleLogin = async ({ email, password }) => {
        isLoading(true) // when user logs in, and api call is made, until the response is received, we have to show the loading screen to user
        try {
            const data = await login({ email, password })
            setUser(data.user)
        }
        catch (error) {
            setUser(null)
            throw error
        }
        finally {
            isLoading(false)
        }
    }

    const handleLogout = async () => {
        isLoading(true)
        try {
            await logout()
            setUser(null)
        }
        catch {
            setUser(null)
        }
        finally {
            isLoading(false)
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('authToken')

        if (!token) {
            setUser(null)
            isLoading(false)
            return
        }

        const getAndSetUser = async () => {
            try {
                const data = await getUserDetails()
                setUser(data?.user ?? null)
            }
            catch {
                setUser(null)
            }
            finally {
                isLoading(false)
            }
        }

        getAndSetUser()

    }, [])

    return { user, loading, handleRegister, handleLogin, handleLogout }
}
