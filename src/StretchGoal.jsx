import { useState } from 'react';

import Header from './components/header';

function StretchGoal() {
    const [noOfPeople, setNoOfPeople] = useState('');
    const [timeAvailable, setTimeAvailable] = useState('');
    const [favoriteMovie, setFavoriteMovie] = useState('');
    const [famousPersonPreference,setFamousPersonPreference] = useState('');

    return (
        <>
            <Header />

            <form className="form-section question-section">
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
                        placeholder="How much time do you have??"
                        id="time-available"
                        value={timeAvailable}
                        onChange={(e) => setTimeAvailable(e.target.value)}
                    />
                </div>

                <div className="form-footer">
                    <button
                        type="submit"
                        disabled={!noOfPeople || !timeAvailable}>
                        Start
                    </button>
                </div>
            </form>

            <form className="form-section question-section">
                <div className="single-question">
                    <label htmlFor="favorite-movie">What's your favorite movie and why?</label>
                    <br />
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
                    <br />
                    
                </div>

                <div className="single-question">
                    <label htmlFor="mood">
                        What are you in the mood for?
                    </label>
                    <br />
                    
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
                        disabled={!favoriteMovie || !timeAvailable}>
                        Next Person
                    </button>
                </div>
            </form>

        </>
    );


}



export default StretchGoal;