import { OPENAI_API_KEY } from '../config-keys.js';

export const getAIMovieResponses = async (movieDataPreferences, personResponses) => {

    console.log("Parsing the objects:", movieDataPreferences, personResponses);
    // const chatMessages = [
    //     {
    //         role: 'system',
    //         content: `You are an enthusiastic movie expert who loves recommending movies to people. 
    // You will be given three pieces of information - the user's favorite movie, the user's mood for something new or a classic and the user's preference for something fun or serious.
    // Your main job is to formulate a short answer to the questions using the provided context. 
    // The answer should in this valid JSON object format, no markdown, no extra text.
    // JSON shape: { "title": string, "description": string, "runtime": string, "rating": number }`,
    //     },
    //     {
    //         role: 'user',
    //         content: `Movie preference: ${movieDataPreferences} Responses from persons: ${personResponses}`
    //     }
    // ];

    // try {
    //     const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${OPENAI_API_KEY}`,
    //         },
    //         body: JSON.stringify({
    //             model: 'gpt-4o-mini',
    //             messages: chatMessages,
    //             temperature: 0.5,
    //             //frequency_penalty: 0.5,
    //         }),
    //     });

    //     await response.json();

    //     if (!response.ok) {
    //         throw new Error(`OpenAI request failed (${response.status})`);
    //     }

    //     // const data = await response.json();
    //     // return JSON.parse(data.choices[0].message.content);

    // } catch (error) {
    //     console.error('Error getting movie poster:', error);

    //     throw error;
    // }

};