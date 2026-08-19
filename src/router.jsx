import { createBrowserRouter } from "react-router";
import App from "./App";
import StretchGoal from "./StretchGoal";

export const router = createBrowserRouter([

    {
        path: '/',
        element: <StretchGoal />
    },

]);