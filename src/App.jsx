import { useState } from 'react';
import { recommendMovie } from './services/recommendMovie';

export default function App() {
  const [favoriteMovie, setFavoriteMovie] = useState('');
  const [mood, setMood] = useState('');
  const [preference, setPreference] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [movie, setMovie] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setShowAnswer(true);
    setLoading(true);
    setError(null);
    setMovie(null);

    try {
      const recommendation = await recommendMovie(favoriteMovie, mood, preference);
      setMovie(recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function handleGoAgain() {
    setShowAnswer(false);
    setLoading(false);
    setError(null);
    setMovie(null);
  }

  return (
    <>
      <header>
        <div className="logo-section">
          <img src="/assets/img/PopChoice-Icon.png" alt="pop-choice" />
          <h1>PopChoice</h1>
        </div>
      </header>

      {!showAnswer ? (
        <form className="form-section question-section" onSubmit={handleSubmit}>
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
            <label htmlFor="mood">Are you in the mood for something new or a classic?</label>
            <br />
            <input
              type="text"
              className="input-form"
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>

          <div className="single-question">
            <label htmlFor="preference">
              Do you wanna have fun or do you want something serious?
            </label>
            <br />
            <input
              type="text"
              className="input-form"
              id="preference"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
            />
          </div>

          <div className="form-footer">
            <button type="submit">Let&apos;s Go</button>
          </div>
        </form>
      ) : (
        <div className="answer-section">
          {loading && <p className="status-message">Finding your perfect movie…</p>}
          {error && <p className="error-message">{error}</p>}
          {movie && (
            <>
              <h2 className="movie-title">{movie.title}</h2>
              <p className="movie-description">{movie.description}</p>
              <p className="movie-runtime">Runtime: {movie.runtime}</p>
              <p className="movie-rating">Rating: {movie.rating}</p>
            </>
          )}

          <div className="form-footer">
            <button type="button" onClick={handleGoAgain} disabled={loading}>
              Go Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
