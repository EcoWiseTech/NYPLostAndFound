import React from 'react'
import UserProfileRoutesPage from './pages/user/UserProfileRoutesPage'
import UserDashboard from './pages/home/UserDashboard'
import AddHome from './pages/home/AddHome'

const ProtectedRoutes = [
    {
        path: "profile/*",
        element: <UserProfileRoutesPage />,
    },
    {
        path: "dashboard",
        element: <UserDashboard />,
    },
    {
        path: "addHome",
        element: <AddHome />,
    },
]



export default ProtectedRoutes