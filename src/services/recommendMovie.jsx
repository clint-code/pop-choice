import movies from '../content.js';
import { WORKER_URL, OPENAI_EMBEDDING_MODEL } from '../config-keys.js';

function toEmbeddingInput(movie) {
  return `${movie.title} (${movie.releaseYear}): ${movie.content}`;
}

const getEmbedding = async (text) => {
  const response = await fetch(`${WORKER_URL}/api/openai/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
    }),
  });
  if (!response.ok) {
    throw new Error(`Embedding request failed (${response.status})`);
  }
  const data = await response.json();
  return data.data[0].embedding;
};

const syncMovieEmbeddings = async () => {
  const rows = [];

  for (const movie of movies) {
    const input = toEmbeddingInput(movie);

    if (typeof input !== 'string' || input.trim().length === 0) {
      console.error('Bad input for movie:', movie, '-> got:', input);
      continue;
    }

    const embedding = await getEmbedding(input);

    rows.push({
      title: movie.title,
      content: movie.content,
      embedding,
    });
  }

  // const { error } = await supabase
  //   .from('popchoice_movies')
  //   .upsert(rows, { onConflict: ['title'] });

  const response = await fetch(`${WORKER_URL}/api/supabase/movies`);
  const payload = await response.json();

  if (error) {
    throw new Error(error.message || 'Error inserting rows into Supabase');
  }
};

const findNearestMatch = async (embedding) => {
  // const { data, error } = await supabase.rpc('match_popchoice_movies', {
  //   query_embedding: embedding,
  //   match_threshold: 0.5,
  //   match_count: 1,
  // });

  const response = await fetch(`${WORKER_URL}/api/supabase/match`, {
    body: JSON.stringify({
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 1,
    }),
  });

  const data = await response.json();
  if (error) {
    throw new Error(error.message || 'Error finding nearest match');
  }

  if (!data?.[0]?.content) {
    throw new Error('No matching movie found');
  }

  return data[0].content;
};

const getChatCompletion = async (text, query) => {

  const chatMessages = [
    {
      role: 'system',
      content: `You are an enthusiastic movie expert who loves recommending movies to people. 
    You will be given three pieces of information - the user's favorite movie, the user's mood for something new or a classic and the user's preference for something fun or serious.
    Your main job is to formulate a short answer to the questions using the provided context. 
    The answer should in this valid JSON object format, no markdown, no extra text.
    JSON shape: { "title": string, "description": string, "runtime": string, "rating": number }`,
    },
    {
      role: 'user',
      content: `Context: ${text} Question: ${query}`,
    },
  ];

  const response = await fetch(`${WORKER_URL}/api/openai/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: chatMessages,
      temperature: 0.5,
      frequency_penalty: 0.5,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed (${response.status})`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
};

export async function recommendMovie(favoriteMovie, mood, preference) {

  const query = `${favoriteMovie} ${mood} ${preference}`;

  await syncMovieEmbeddings();

  const queryEmbedding = await getEmbedding(query);
  const match = await findNearestMatch(queryEmbedding);

  return getChatCompletion(match, query);
}
