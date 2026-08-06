import { useState } from 'react';


export default function MovieRecommendations() {

    // const [movie, setMovie] = useState(null);

    return (
        <div className="answer-section mt-5">
            {/* {movie && (
                <>
                    <h2 className="movie-title">{movie.title}</h2>
                    <img src="" alt="" />
                    <p className="movie-description">{movie.description}</p>
                </>
            )} */}

            <>
                <h2 className="movie-title">The Martian (2006)</h2>
                <img src="" alt="" />
                <p className="movie-description">
                    The incredible true story of Dieter Dengler epic struggle of survival after being shot down on a mission over Laos during the Vietnam War
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