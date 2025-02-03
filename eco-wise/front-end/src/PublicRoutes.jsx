import React from 'react'
import Homepage from './pages/Homepage'
import Weatherpage from './pages/Weatherpage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PasswordResetPage from './pages/PasswordResetPage'
import FindItemPage from './pages/home/FindItemPage'

const PublicRoutes = [
   
    {
        path: "",
        element: <Homepage />,
    },
    {
        path:"/login",
        element: <LoginPage />
    },
    {
        path:"/register",
        element: <RegisterPage />
    },
    {
        path:"/findItem",
        element: <FindItemPage />
    },
    {
        path: "/password-reset/:email/:code",
        element: <PasswordResetPage />
    },    
    {
        path: "weatherpage",
        element: <Weatherpage />,
    },
]



export default PublicRoutes