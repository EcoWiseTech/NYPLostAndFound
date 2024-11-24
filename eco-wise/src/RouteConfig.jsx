import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Homepage from "./pages/Homepage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "",
        element: <Homepage />,
      },
    ],
  },
]);

export default router;