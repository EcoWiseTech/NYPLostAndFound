import React from 'react'
import Homepage from './pages/Homepage'
import Weatherpage from './pages/Weatherpage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

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
        path: "weatherpage",
        element: <Weatherpage />,
    },
]



export default PublicRoutes