import { useState, useEffect } from 'react';

export const Recommendations = () => {

    return (
        <div className="answer-section">
            {/* {movie && (
                <>
                    <h2 className="movie-title">{movie.title}</h2>
                    <img src="" alt="" />
                    <p className="movie-description">{movie.description}</p>
                </>
            )} */}

            <>
                <h2 className="movie-title">Arrival (2016)</h2>
                <img src="https://image.tmdb.org/t/p/original/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg" alt="" />
                <p className="movie-description">
                    With its thought-provoking narrative and stunning visuals, 'Arrival' explores complex themes of communication 
                    and understanding, making it an inspiring choice that resonates with Person 1's favor for 'Interstellar'.
                </p>
            </>

            <div className="form-footer">
                <button type="button">
                    Next Movie
                </button>

            </div>
        </div>
    );
    
}