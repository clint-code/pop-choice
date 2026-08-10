import { THEMOVIEDB_API_KEY } from '../config-keys.js';



export const getMoviePoster = async ( currentMovie) => {

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?${currentMovie?.title}include_adult=false&language=en-US&page=1`,
      // "https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1",
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${THEMOVIEDB_API_KEY}`
        }
      }
    );
  } catch (error) {
    console.error('Error getting movie poster:', error);
  }

};