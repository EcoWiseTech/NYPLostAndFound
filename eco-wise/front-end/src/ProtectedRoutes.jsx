import React from 'react'
import UserProfileRoutesPage from './pages/user/UserProfileRoutesPage'
import AddHomePage from './pages/home/AddHomePage'
import UserDashboardPage from './pages/home/UserDashboardPage'
import ViewHomePage from './pages/home/ViewHomePage'
import EditHomePage from './pages/home/EditHomePage'
import Budget from './pages/Budget'
import AddItemPage from './pages/home/AddItemPage'
import EditItemPage from './pages/home/EditItemPage'
import StudentDashboardPage from './pages/home/StudentDashboard'
import AddItemStudentPage from './pages/home/AddItemStudentPage'
import EditItemStudentPage from './pages/home/EditItemStudentPage'


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
        path: "studentDashboard",
        element: <StudentDashboardPage />,
    },
    {
        path: "addItem",
        element: <AddItemPage />,
    },
    {
        path: "addItemStudent",
        element: <AddItemStudentPage />,
    },
    {
        path: "item/edit/:uuid",
        element: <EditItemPage />,
    },
    {
        path: "item/editStudent/:uuid",
        element: <EditItemStudentPage />,
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