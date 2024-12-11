import React from 'react'
import Homepage from './pages/Homepage'
import Weatherpage from './pages/Weatherpage'

const PublicRoutes = [
    {
        path: "",
        element: <Homepage />,
    },
    {
        path: "weatherpage",
        element: <Weatherpage />,
    },
]



export default PublicRoutes