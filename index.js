import { openai, supabase } from './config.js';
import movies from './content.js';
import { OPENAI_API_KEY } from './config-keys';

document.getElementById('submit-btn').addEventListener('click', handleSubmit);
//document.getElementById('go-again-btn').addEventListenter('click', showForm);

function showForm() {

    document.querySelector(".form-section").style.display = "block";
    document.querySelector(".answer-section").style.display = "none";

}

function handleSubmit() {

    document.querySelector(".form-section").style.display = "none";

    document.querySelector(".answer-section").style.display = "block";

    const favoriteMovie = document.getElementById('favorite-movie').value;
    const mood = document.getElementById('mood').value;
    const preference = document.getElementById('preference').value;

    const query = `${favoriteMovie} ${mood} ${preference}`;

    console.log("Query:", query);

    main(query);

}

//bring all the function calls together
async function main(massiveQuery) {

    const rows = [];

    for (const movie of movies) {
        const input = toEmbeddingInput(movie);

        if (typeof input !== "string" || input.trim().length === 0) {
            console.error("Bad input for movie:", movie, "-> got:", input);
            continue; // or throw, to stop immediately
        }

        const embedding = await getEmbedding(input);

        rows.push({
            title: movie.title,
            content: movie.content,
            embedding,
        });

    }

    const { data, error } = await supabase
        .from('popchoice_movies')
        .upsert(rows, { onConflict: ['title'] });

    if (error) {
        console.error('Error inserting rows:', error);
        process.exit(1);
    }

    const queryEmbedding = await getEmbedding(massiveQuery);
    const match = await findNearestMatch(queryEmbedding);

    await getChatCompletion(match, massiveQuery);

}

//turn one movie object into a single text blob to embed
function toEmbeddingInput(movie) {
    return `${movie.title} (${movie.releaseYear}): ${movie.content}`;
}

//get embedding for each movie
async function getEmbedding(text) {

    const response = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: text
    });

    return response.data[0].embedding;
}

//Query Supabase and return a sematically matching text chunk
async function findNearestMatch(embedding) {
    console.log("Finding nearest match for embedding:", embedding);

    const { data } = await supabase.rpc('match_popchoice_movies', {
        query_embedding: embedding,
        match_threshold: 0.50,
        match_count: 1
    });

    console.log("Data:", data);

    return data[0].content;
}

const chatMessages = [{
    role: 'system',
    content: `You are an enthusiastic movie expert who loves recommending movies to people. 
    You will be given three pieces of information - the user's favorite movie, the user's mood for something new or a classic and the user's preference for something fun or serious.
    Your main job is to formulate a short answer to the questions using the provided context. 
    The answer should in this valid JSON object format, no markdown, no extra text.
    JSON shape: { "title": string, "description": string, "runtime": string, "rating": number }`
}];

async function getChatCompletion(text, query) {
    chatMessages.push({
        role: 'user',
        content: `Context: ${text} Question: ${query}`
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            response_format: { type: 'json_object' },
            messages: chatMessages,
            temperature: 0.5,
            frequency_penalty: 0.5
        })
    });

    const data = await response.json();
    console.log("Data:", data);

    const movie = JSON.parse(data.choices[0].message.content);
    console.log("Movie Recommendation:", movie);

    document.querySelector(".movie-title").textContent = movie.title;
    document.querySelector(".movie-description").textContent = movie.description;
    document.querySelector(".movie-runtime").textContent = `Runtime: ${movie.runtime}`;
    document.querySelector(".movie-rating").textContent = `Rating: ${movie.rating}`;

}