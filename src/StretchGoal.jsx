import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import popChoiceLogo from '/assets/img/PopChoice-Icon.png';
// import Header from './components/header';

export default function StretchGoal() {
    const [noOfPeople, setNoOfPeople] = useState(0);
    const [peopleCount, setPeopleCount] = useState(0);
    const [timeAvailable, setTimeAvailable] = useState('');
    const [stats, setStats] = useState(false);

    const [favoriteMovie, setFavoriteMovie] = useState('');
    const [famousPersonPreference, setFamousPersonPreference] = useState('');
    const [movieDataPreferences, setMovieDataPreferences] = useState([]);
    const [movieType, setMovieType] = useState('');
    const [movieMood, setMovieMood] = useState('');

    const navigate = useNavigate();
    
    function clearPersonForm() {
        setFavoriteMovie('');
        setMovieType('');
        setMovieMood('');
        setFamousPersonPreference('');
    }

    function startUserPreferences(e) {
        e.preventDefault();
        setMovieDataPreferences([]);
        setPeopleCount(1);
        setStats(true);
        clearPersonForm();
    }

    function submitMovieDataPreferences(e) {
        e.preventDefault();
        const preferences = {
            favoriteMovie,
            movieType,
            movieMood,
            famousPersonPreference,
        };

        if (movieDataPreferences.length >= noOfPeople) {
            return;
        }

        const nextPreferences = [...movieDataPreferences, preferences];
        setMovieDataPreferences(nextPreferences);
        setPeopleCount(Math.min(nextPreferences.length + 1, noOfPeople));

        if (nextPreferences.length < noOfPeople) {
            clearPersonForm();
        } else {
            console.log(
                'All preferences collected, route to Movie Recommendations....',
                nextPreferences,
            );
            navigate('/movie-recommendations');
        }
    }

    const isLastPerson = movieDataPreferences.length >= noOfPeople - 1;

    return (
        <>
            <header>
                <div className="logo-section">
                    <img
                        className="my-0 mx-auto"
                        src={popChoiceLogo}
                        alt="pop-choice"
                        width={99}
                        height={108} />

                    <h1 className="text-center text-2xl font-bold mt-5">
                        {(stats == true && noOfPeople > 0) ? peopleCount : 'PopChoice 2.0'}
                    </h1>

                </div>
            </header>

            {!stats ? (
                <form className="form-section question-section mb-5" onSubmit={startUserPreferences}>

                    <div className="single-question">
                        <br />
                        <input
                            type="number"
                            className="input-form"
                            placeholder="How many people?"
                            id="no-of-people"
                            value={noOfPeople}
                            onChange={(e) => setNoOfPeople(Number(e.target.value))}
                        />
                    </div>

                    <div className="single-question">
                        <br />
                        <input
                            type="text"
                            className="input-form"
                            placeholder="How much time do you have?"
                            id="time-available"
                            value={timeAvailable}
                            onChange={(e) => setTimeAvailable(e.target.value)}
                        />
                    </div>

                    <div className="form-footer">
                        <button
                            type="submit"
                            disabled={noOfPeople <= 0 || !timeAvailable}>
                            Start
                        </button>
                    </div>
                </form>
            ) : (
                <form className="form-section question-section" onSubmit={submitMovieDataPreferences}>
                    <div className="single-question">
                        <label htmlFor="favorite-movie">What's your favorite movie and why?</label>
                        <input
                            type="text"
                            className="input-form"
                            id="favorite-movie"
                            value={favoriteMovie}
                            onChange={(e) => setFavoriteMovie(e.target.value)}
                        />
                    </div>

                    <div className="single-question">
                        <label htmlFor="mood">
                            Are you in the mood for something new or a classic?
                        </label>

                        <div className="flex gap-4 mt-2">
                            <button
                                className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] ${movieType === 'new' ? 'ring-2 ring-green-600' : ''}`}
                                type="button"
                                onClick={() => setMovieType('new')}>
                                New
                            </button>
                            <button
                                className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] ${movieType === 'classic' ? 'ring-2 ring-green-600' : ''}`}
                                type="button"
                                onClick={() => setMovieType('classic')}>
                                Classic
                            </button>
                        </div>

                        <input
                            required
                            type="hidden"
                            className="input-form"
                            id="movieType"
                            value={movieType}
                        />

                    </div>

                    <div className="single-question">

                        <label htmlFor="mood">
                            What are you in the mood for?
                        </label>

                        <div className="flex gap-4 mt-2">
                            <button
                                className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] ${movieMood === 'fun' ? 'ring-2 ring-green-600' : ''}`}
                                type="button"
                                onClick={() => setMovieMood('fun')}>
                                Fun
                            </button>
                            <button
                                className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] ${movieMood === 'serious' ? 'ring-2 ring-green-600' : ''}`}
                                type="button"
                                onClick={() => setMovieMood('serious')}>
                                Serious
                            </button>
                            <button
                                className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] ${movieMood === 'inspiring' ? 'ring-2 ring-green-600' : ''}`}
                                type="button"
                                onClick={() => setMovieMood('inspiring')}>
                                Inspiring
                            </button>
                            <button
                                className={`bg-[#3B4877] text-white rounded-md px-2 py-2 hover:bg-[#273152] ${movieMood === 'scary' ? 'ring-2 ring-green-600' : ''}`}
                                type="button"
                                onClick={() => setMovieMood('scary')}>
                                Scary
                            </button>
                        </div>

                        <input
                            required
                            type="hidden"
                            className="input-form"
                            id="movieMood"
                            value={movieMood}
                        />

                    </div>

                    <div className="single-question">
                        <label htmlFor="famous-person-preference">
                            Which famous film person would you love to be stranded on an island with and why?
                        </label>
                        <br />
                        <input
                            type="text"
                            className="input-form"
                            id="famous-person-preference"
                            value={famousPersonPreference}
                            onChange={(e) => setFamousPersonPreference(e.target.value)}
                        />
                    </div>

                    <div className="form-footer">
                        <pre className="text-white">No. of people: {noOfPeople}</pre>
                        <pre className="text-white">Movie preferences array: {movieDataPreferences.length}</pre>
                        <button
                            type="submit"
                            disabled={!favoriteMovie || !movieType || !movieMood || !famousPersonPreference}>
                            {isLastPerson ? 'Get Movie' : 'Next Person'}
                        </button>
                    </div>
                </form>
            )}

        </>
    );


}
