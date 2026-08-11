import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoviePoster } from './services/getMoviePoster';
import { getMovieDBAccess } from './services/loginToMovieDBApi';
import { getAIMovieResponses } from './services/searchMovieRecommendations';

import popChoiceLogo from '/assets/img/PopChoice-Icon.png';
// import Header from './components/header';
import { Questions } from './components/Questions';

export default function StretchGoal() {

    const [allowedNumberofPersons, setAllowedNumberofPersons] = useState(1);
    const [collectedFormResponses, setCollectedFormResponses] = useState({});
    const [personCount, setPersonCount] = useState(1);
    const [timeAvailable, setTimeAvailable] = useState('');
    const [stats, setStats] = useState(false);

    const [movieDataPreferences, setMovieDataPreferences] = useState({});
    const [hitAIEndpoint, setHitAIEndpoint] = useState(false);
    //const [allowedNumberOfPeople, setAllowedNumberOfPeople] = useState(1);

    const navigate = useNavigate();

    const clearPersonForm = () => {
        setFavoriteMovie('');
        setMovieType('');
        setMovieMood('');
        setFamousPersonPreference('');
    };

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
        console.log("Movie data preference:", newUserPreferences);
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

        console.log("Collected form response:", collectedFormResponses + "For the person count" + personCount);

    };

    const handleFinalMovieSubmission = async (e) => {

        e.preventDefault();

        setHitAIEndpoint(true);

        const formData = new FormData(e.target);
        const userQueryResponses = Object.fromEntries(formData);
        console.log("User query response:", userQueryResponses);

        const userResponses = Object.values(userQueryResponses).join(', ');
        console.log("User responses:", userResponses);

        const stringifiedQueryAndResponse = Object.entries(userQueryResponses)
            .map(
                ([key, value], index) =>
                    `Question ${index + 1}: ${key}\nAnswer: ${value}`
            ).join('\n\n');

        console.log("Stringified query and response:", stringifiedQueryAndResponse);

        const finalResponses = { ...collectedFormResponses };
        console.log("Final responses:", finalResponses);

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
            const movieDbResponse = await getMovieDBAccess();
            
            getAIMovieRecommendations(finalResponses.movieDataPreferences, finalResponses.personResponses);

        } catch (error) {

            console.log("Error!", error);
        }

    };

    const getAIMovieRecommendations = async (movieDataPreferences, personResponses) => {
        console.log("Hit AI API endpoint!", movieDataPreferences, personResponses);

        const openAIResponse = await getAIMovieResponses(movieDataPreferences, personResponses);

        console.log("Open AI response:", openAIResponse);

        if (openAIResponse) {

            setHitAIEndpoint(false);
            console.log("Open AI response:", openAIResponse);
            //const data = await openAIResponse.json();
            //console.log(JSON.parse(data.content));

        }

    };

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
                        {stats ? personCount : 'PopChoice 2.0'}
                    </h1>

                </div>
            </header>

            {!stats ? (
                <form className="form-section question-section mb-5" onSubmit={startUserPreferences}>

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

        </>
    );


}
