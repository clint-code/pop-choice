import { WORKER_URL } from '../config-keys.js';


export const getMovieDBAccess = async () => {

  try {
    const response = await fetch(`${WORKER_URL}/api/tmdb/authentication`);

    return  response.json();
  } catch (error) {
    console.error('Error getting movie poster:', error);

    throw error;
  }

};