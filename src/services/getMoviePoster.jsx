import { WORKER_URL } from '../config-keys.js';


export const getMoviePoster = async (movieTitle, movieYearRelease) => {

  try {
    const params = new URLSearchParams({
      query: movieTitle,
      include_adult: 'false',
      language: 'en-US',
      primary_release_year: movieYearRelease,
      page: '1',
    });
    const response = await fetch(
      `${WORKER_URL}/api/tmdb/search/movie?${params.toString()}`
    );
    if (!response.ok) {
      throw new Error(`Poster request failed (${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error getting movie poster:', error);
  }

};