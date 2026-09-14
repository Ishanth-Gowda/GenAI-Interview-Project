import { createContext, useState } from 'react'

export const authContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, isLoading] = useState(true)


    return (
        <authContext.Provider value={{ user, setUser, loading, isLoading }}>
            {children}
        </authContext.Provider>
    )
}

// here, children means all the components that are wrapped inside the AuthProvider in App.jsx. It allows us to provide the authentication context to all the components in the application.
// its a prop which is used to pass data from parent component to child component. In this case, it is used to pass the authentication context to all the components in the application.