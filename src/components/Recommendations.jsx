import { useState, useEffect } from 'react';
import { getMoviePoster } from '../services/getMoviePoster';

export const Recommendations = ({ movieAIRecommendations, handleRepeat }) => {

    const [currentRecommendationIndex, setCurrentRecommendationIndex] = useState(0);
    const [currentMoviePosterURL, setCurrentMoviePosterURL] = useState(null);
    const movieRecommendations = movieAIRecommendations.recommendations ?? [];

    const finalRecommendationIndex = movieRecommendations.length - 1;

    const currentMovie = movieRecommendations[currentRecommendationIndex];
    const currentMovieTitle = currentMovie.title;
    const currentMovieYear = currentMovie.yearOfRelease;
    const movieDescription = currentMovie.description;

    const handleNextMovieRecommendation = () => {
        setCurrentRecommendationIndex(currentRecommendationIndex + 1);
        setCurrentMoviePosterURL(null);
    };

    const getMoviePosterFromAPI = async () => {

        try {
            const response = await getMoviePoster(currentMovieTitle, currentMovieYear);
            setCurrentMoviePosterURL(response.results[0].poster_path);
        } catch (error) {
            console.log("Error ", error);
            setCurrentMoviePosterURL(null);
        }
    };

    useEffect(() => {
        getMoviePosterFromAPI();
    }, [currentMovie]);

    return (

        <>
            {
                currentMovie ? (
                    <div className="answer-section">

                        <h2 className="movie-title text-center">{currentMovieTitle} ({currentMovieYear})</h2>
                        {
                            currentMoviePosterURL ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/original/${currentMoviePosterURL}`}
                                    alt={currentMovieTitle}
                                    className='w-[400px] h-auto rounded-md mx-auto'
                                />
                            ) : <p> Loading poster....</p>
                        }

                        <p className="movie-description text-center text-xl mt-2">
                            {movieDescription}
                        </p>

                        <div className="form-footer">
                            <button
                                type="button"
                                onClick={
                                    currentRecommendationIndex >= finalRecommendationIndex
                                        ? handleRepeat
                                        : handleNextMovieRecommendation
                                }
                            >
                                {currentRecommendationIndex >= finalRecommendationIndex ? 'Go Again' : 'Next Movie'}
                            </button>

                        </div>
                    </div>
                ) : (
                    <p>
                        No more recommendations
                    </p>
                )
            }


        </>

    );

};