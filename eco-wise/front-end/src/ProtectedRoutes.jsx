import React from 'react'
import UserProfileRoutesPage from './pages/user/UserProfileRoutesPage'
import AddHomePage from './pages/home/AddHomePage'
import UserDashboardPage from './pages/home/UserDashboardPage'
import ViewHomePage from './pages/home/ViewHomePage'
import EditHomePage from './pages/home/EditHomePage'
import Budget from './pages/Budget'
import AddItemPage from './pages/home/AddItemPage'


const ProtectedRoutes = [
    {
        path: "/budget",
        element: <Budget />,
    },
    {
        path: "profile/*",
        element: <UserProfileRoutesPage />,
    },
    {
        path: "dashboard",
        element: <UserDashboardPage />,
    },
    {
        path: "addItem",
        element: <AddItemPage />,
    },
    {
        path: "home/view/:uuid",
        element: <ViewHomePage />,
    },
    {
        path: "home/edit/:uuid",
        element: <EditHomePage />,
    },
]



export default ProtectedRoutes