import { createBrowserRouter } from "react-router";
import App from "./App";
import MovieRecommendations from "./MovieRecommendations";
import StretchGoal from "./StretchGoal";

export const router = createBrowserRouter([

    {
        path: '/',
        element: <App />
    },

    {
        path: '/pop-choice-2.0',
        element: <StretchGoal />
    },

    {
        path: '/movie-recommendations',
        element: <MovieRecommendations />
    }
]);