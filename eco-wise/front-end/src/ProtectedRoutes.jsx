import React from 'react'
import UserProfilePage from './pages/user/UserProfilePage'

const ProtectedRoutes = [
    {
        path: "profile",
        element: <UserProfilePage />,
    },
]



export default ProtectedRoutes