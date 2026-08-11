import { THEMOVIEDB_API_KEY } from '../config-keys.js';


export const getMovieDBAccess = async () => {

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
    console.error('Error getting movie poster:', error);

    throw error;
  }

};