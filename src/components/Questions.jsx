import { useState } from 'react';

export const Questions = ({
    handleNextPerson,
    allowedNumberofPersons,
    personCount,
    handleFinalMovieSubmission,
    hitAIEndpoint
}) => {

    //State for all form fields
    const [favoriteMovie, setFavoriteMovie] = useState('');
    const [famousPersonPreference, setFamousPersonPreference] = useState('');
    const [movieDataPreferences, setMovieDataPreferences] = useState([]);
    const [movieType, setMovieType] = useState([]);
    const [movieMood, setMovieMood] = useState('');

    const clearPersonForm = () => {
        setFavoriteMovie('');
        setMovieType('');
        setMovieMood([]);
        setFamousPersonPreference('');
    };

    const submitMovieDataPreferences = (e) => {
        e.preventDefault();

        if (personCount >= allowedNumberofPersons) {
            handleFinalMovieSubmission(e);

        } else {
            handleNextPerson(e);

            clearPersonForm();
        }

    };

    const buttonText = () => {
        if (hitAIEndpoint) {
            return 'Searching for movies...';
        } else if (personCount >= allowedNumberofPersons) {
            return 'Get Movie';
        } else {
            return 'Next Person';
        }
    };

    return (
        <form className="form-section question-section" onSubmit={submitMovieDataPreferences}>

            {/**Question 1: Favorite Movie */}
            <div className="single-question">
                <label htmlFor="favorite-movie">
                    What's your favorite movie and why?
                </label>
                <input
                    type="text"
                    className="input-form"
                    id="favorite-movie"
                    name="Your favorite movie and why"
                    value={favoriteMovie}
                    onChange={(e) => setFavoriteMovie(e.target.value)}
                    required
                />
            </div>

            {/**Question 2: New or Classic */}
            <div className="single-question">
                <label htmlFor="new-classic">
                    Are you in the mood for something new or a classic?
                </label>
                <div className="flex gap-4 mt-2">
                    {['New', 'Classic'].map((option) => (
                        <button
                            className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] 
                                ${movieType === option ? 'ring-2 ring-green-600' : ''
                                }`}
                            type="button"
                            key={option}
                            onClick={() => setMovieType(option)}>
                            {option}
                        </button>
                    ))}
                </div>
                <input
                    required
                    type="hidden"
                    name="A classic or new movie"
                    className="input-form"
                    id="movieType"
                    value={movieType}
                />
            </div>

            {/**Question 3: Movie Mood */}
            <div className="single-question">
                <label htmlFor="mood">
                    What are you in the mood for?
                </label>
                <div className="flex gap-4 mt-2">
                    {['Fun', 'Serious', 'Inspiring', 'Scary'].map((mood) => (
                        <button
                            className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] 
                            ${movieMood === mood ? 'ring-2 ring-green-600' : ''
                                }`}
                            type="button"
                            key={mood}
                            onClick={() => setMovieMood(mood)}>
                            {mood}
                        </button>
                    ))}
                </div>
                <input
                    required
                    type="hidden"
                    className="input-form"
                    id="movieMood"
                    name="Your movie mood preference"
                    value={movieMood}
                />
            </div>

            {/**Question 4: Famous Person */}
            <div className="single-question">
                <label htmlFor="famous-person-preference">
                    Which famous film person would you love to be stranded on an island with and why?
                </label>
                <input
                    type="text"
                    className="input-form"
                    name="The famous film person you'd like to be with"
                    id="famous-person-preference"
                    value={famousPersonPreference}
                    onChange={(e) => setFamousPersonPreference(e.target.value)}
                />
            </div>

            <div className="form-footer">
                <button
                    type="submit"
                    disabled={!favoriteMovie || !movieType || !movieMood || !famousPersonPreference || hitAIEndpoint}>
                    {buttonText()}
                </button>
            </div>
        </form>
    );
};