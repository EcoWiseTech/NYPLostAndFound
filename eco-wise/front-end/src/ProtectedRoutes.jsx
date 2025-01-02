import React from 'react'
import UserProfileRoutesPage from './pages/user/UserProfileRoutesPage'
import AddHomePage from './pages/home/AddHomePage'
import UserDashboardPage from './pages/home/UserDashboardPage'
import ViewHomePage from './pages/home/ViewHomePage'

const ProtectedRoutes = [
    {
        path: "profile/*",
        element: <UserProfileRoutesPage />,
    },
    {
        path: "dashboard",
        element: <UserDashboardPage />,
    },
    {
        path: "addHome",
        element: <AddHomePage />,
    },
    {
        path: "home/view/:uuid",
        element: <ViewHomePage />,
    },
]



export default ProtectedRoutes