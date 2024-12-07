import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Homepage from "./pages/Homepage";
import Weatherpage from "./pages/Weatherpage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "",
        element: <Homepage />,
      },
      {
        path: "weatherpage",
        element: <Weatherpage />,
      },
    ],
  },
]);

export default router;