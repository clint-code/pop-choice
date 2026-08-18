import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoviePoster } from './services/getMoviePoster';
// import { getMovieDBAccess } from './services/loginToMovieDBApi';
import { getAIMovieResponses } from './services/searchMovieRecommendations';

import { THEMOVIEDB_API_KEY } from './config-keys';

import popChoiceLogo from '/assets/img/PopChoice-Icon.png';
// import Header from './components/header';
import { Questions } from './components/Questions';
import { Recommendations } from './components/Recommendations';

export default function StretchGoal() {

    const [allowedNumberofPersons, setAllowedNumberofPersons] = useState(1);
    const [collectedFormResponses, setCollectedFormResponses] = useState({});
    const [personCount, setPersonCount] = useState(1);
    const [timeAvailable, setTimeAvailable] = useState('');
    const [stats, setStats] = useState(false);
    const [hitAIEndpoint, setHitAIEndpoint] = useState(false);
    const [aIMovieResponses, setAIMovieResponses] = useState([]);
    const [aIMovieRecommendations, setAIMovieRecommendations] = useState(false);
    const navigate = useNavigate();

    const startUserPreferences = (e) => {
        e.preventDefault();

        const newUserPreferences = {
            movieStartPreferences: {
                numberOfPeople: allowedNumberofPersons,
                movieRuntime: `Movie runtime ${timeAvailable} available`
            }
        };
        setCollectedFormResponses(newUserPreferences);

        setStats(true);
    };

    const handleNextPerson = (e) => {
        const formData = new FormData(e.target);
        const userQueryResponses = Object.fromEntries(formData);

        const userResponses = Object.values(userQueryResponses).join(', ');

        const stringifiedQueryAndResponse = Object.entries(userQueryResponses)
            .map(
                ([key, value], index) =>
                    `Question ${index + 1}: ${key}\nAnswer: ${value}`
            ).join('\n\n');


        setCollectedFormResponses({
            ...collectedFormResponses,
            personResponses: [
                ...(collectedFormResponses?.personResponses ?? []),
                {
                    userResponses,
                    stringifiedQueryAndResponse: `Person ${personCount}: \n\n ${stringifiedQueryAndResponse}`
                }
            ]
        });
        setPersonCount(personCount + 1);

    };

    const handleFinalMovieSubmission = async (e) => {

        e.preventDefault();

        setHitAIEndpoint(true);

        const formData = new FormData(e.target);
        const userQueryResponses = Object.fromEntries(formData);

        const userResponses = Object.values(userQueryResponses).join(', ');

        const stringifiedQueryAndResponse = Object.entries(userQueryResponses)
            .map(
                ([key, value], index) =>
                    `Question ${index + 1}: ${key}\nAnswer: ${value}`
            ).join('\n\n');


        const finalResponses = { ...collectedFormResponses };

        if (finalResponses.personResponses) {
            finalResponses.personResponses.push({
                userResponses,
                stringifiedQueryAndResponse: `Person ${personCount}: \n\n ${stringifiedQueryAndResponse}`
            });
        } else {
            finalResponses.personResponses = [{
                userResponses,
                stringifiedQueryAndResponse: `Person ${personCount}: \n\n ${stringifiedQueryAndResponse}`
            }];
        }

        try {
            const response = await fetch(
                `https://api.themoviedb.org/3/authentication`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${THEMOVIEDB_API_KEY}`
                    }
                }
            );
            await response.json();
        } catch (error) {
            console.error('Error! ', error);

            throw error;
        }

        await getAIMovieRecommendations(finalResponses);

    };

    const getAIMovieRecommendations = async (finalResponses) => {

        try {
            const data = await getAIMovieResponses(finalResponses);
            // const movieTitle = data.title;
            // const movieDescription = data.description;

            setHitAIEndpoint(false);
            setAIMovieResponses(data);
            setAIMovieRecommendations(true);
        } catch (error) {
            console.error('Error:', error);
            setHitAIEndpoint(false);
            throw error;
        }

    };

    const handleRepeat = () => {
        setHitAIEndpoint(false);
        setAIMovieRecommendations(false);
        setAIMovieResponses([]);
        setPersonCount(1);
        setStats(false);
        setAllowedNumberofPersons(1);
        setTimeAvailable('');
    };

    return (

        <div className='pop-choice'>
            {aIMovieRecommendations ? (
                <Recommendations
                    movieAIRecommendations={aIMovieResponses}
                    handleRepeat = {handleRepeat}
                 />
            ) : (
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
                                {stats ? personCount : 'PopChoice 2.0'}
                            </h1>

                        </div>
                    </header>

                    <div className='mt-2 p-8'>
                        {!stats ? (
                            <form className="form-section question-section mb-5" onSubmit={startUserPreferences}>

                                {/**Question 1: How many people */}
                                <div className="single-question">
                                    <input
                                        type="number"
                                        className="input-form"
                                        placeholder="How many people?"
                                        id="no-of-people"
                                        required
                                        value={allowedNumberofPersons}
                                        onChange={(e) => setAllowedNumberofPersons(Number(e.target.value))}
                                        max={5}
                                        min={1}
                                    />
                                    {allowedNumberofPersons &&
                                        parseInt(allowedNumberofPersons) > 5 ? (
                                        <p className='text-red-700 text-sm text-center mt-4'>
                                            Maximum 5 people allowed
                                        </p>
                                    ) : (
                                        ''
                                    )}
                                </div>

                                {/**Question 2: How much time do you have */}
                                <div className="single-question">
                                    <input
                                        type="text"
                                        className="input-form"
                                        placeholder="How much time do you have?"
                                        id="time-available"
                                        required
                                        value={timeAvailable}
                                        onChange={(e) => setTimeAvailable(e.target.value)}
                                    />
                                </div>

                                <div className="form-footer">
                                    <button
                                        type="submit"
                                        disabled={!timeAvailable || allowedNumberofPersons > 5 || !allowedNumberofPersons}>
                                        Start
                                    </button>
                                </div>

                            </form>
                        ) : (
                            <Questions
                                handleFinalMovieSubmission={handleFinalMovieSubmission}
                                handleNextPerson={handleNextPerson}
                                hitAIEndpoint={hitAIEndpoint}
                                personCount={personCount}
                                allowedNumberofPersons={allowedNumberofPersons}
                            />
                        )}
                    </div>
                </>

            )}
        </div>


    );


}
