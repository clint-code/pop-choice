import { useState } from 'react';
import popChoiceLogo from '/assets/img/PopChoice-Icon.png';

// import Header from './components/header';

export default function StretchGoal() {
    const [noOfPeople, setNoOfPeople] = useState(0);
    const [timeAvailable, setTimeAvailable] = useState('');
    const [stats, setStats] = useState(false);

    const [favoriteMovie, setFavoriteMovie] = useState('');
    const [famousPersonPreference, setFamousPersonPreference] = useState('');
    const [movieDataPreferences, setMovieDataPreferences] = useState([]);
    const [movieType, setMovieType] = useState('');
    const [movieMood, setMovieMood] = useState('');

    function startUserPreferences(e) {
        e.preventDefault();
        setStats(true);
        console.log('Number of People:', noOfPeople);
        console.log('Time Available:', timeAvailable);
    }

    function submitMovieDataPreferences(e) {
        e.preventDefault();
        const preferences = {
            favoriteMovie,
            movieType,
            movieMood,
            famousPersonPreference,
        };
        setMovieDataPreferences([...movieDataPreferences, preferences]);
        console.log('Movie Data Preferences:', movieDataPreferences);
        console.log('Array length:', movieDataPreferences.length + 1);
    }

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
                        {noOfPeople < 1 ? 'PopChoice' : noOfPeople}
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
                            onChange={(e) => setNoOfPeople(e.target.value)}
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
                        <button
                            type="submit"
                            disabled={!favoriteMovie || !movieType || !movieMood || !famousPersonPreference}>
                            {noOfPeople > 1 ? 'Next Person' : 'Get Movie'}
                        </button>
                    </div>
                </form>
            )}

        </>
    );


}
