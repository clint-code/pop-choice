import { THEMOVIEDB_API_KEY } from '../config-keys.js';


export const getMoviePoster = async (movieTitle, movieYearRelease) => {

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${movieTitle}&include_adult=false&language=en-US&primary_release_year=${movieYearRelease}&page=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${THEMOVIEDB_API_KEY}`
        }
      }
    );
    const data = await response.json(); 
    return data;
    
  } catch (error) {
    console.error('Error getting movie poster:', error);
  }

};