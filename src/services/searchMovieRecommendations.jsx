import { openai, supabase } from '../config.js';
import { OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL } from '../config-keys.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const chunkMovies = async (movies) => {

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 15
    });

    const allChunks = [];

    for (const movie of movies) {
        const chunks = await splitter.createDocuments([movie.content]);

        for (const chunk of chunks) {
            allChunks.push({
                title: movie.title,
                yearOfRelease: movie.yearOfRelease,
                description: movie.description,
                content: chunk.pageContent,
            });
        }

    }

    return allChunks;
};

const parseMovieEntry = async () => {

    //load movies.txt as one string
    const text = await fetch('./movies.txt').then(res => res.text());

    //split the text into movie blocks
    const movieBlocks = text
        .split(/\n\s*\n/)
        .map(block => block.trim())
        .filter(Boolean);

    const movies = [];

    for (const block of movieBlocks) {
        const lines = block.split('\n');

        const firstLine = lines[0];
        const description = lines.slice(1).join(' ');

        const [titlePart, rest] = firstLine.split(':');
        const title = titlePart.trim();
        const yearOfRelease = rest.trim().split('|')[0].trim();

        movies.push({
            title,
            yearOfRelease,
            description,
            content: `${title}: ${yearOfRelease} | ${description}`
        });

    }

    return movies;

};

const movieKey = (title, year) => `${title} |${year}`;

const ensureEmbeddingsExist = async () => {
    //read all movies from movies.txt
    const movies = await parseMovieEntry();

    // const { count } = await supabase
    //     .from('movienight_choice')
    //     .select('*', { count: 'exact', head: true });

    // if (count === 0) {
    //     await createAndStoreEmbeddings();
    // }

    // 2. Read what's already in Supabase
    const { data: existingRows, error } = await supabase
        .from('movienight_choice')
        .select('title, year_of_release');

    if (error) throw new Error(error.message);

    // 3. Build a set of existing movies (title + year as unique key)
    const existingKeys = new Set(
        (existingRows ?? []).map(row => movieKey(row.title, row.year_of_release))
    );

    //4. Keep only movies that aren't in the database yet
    const newMovies = movies.filter(
        movie => !existingKeys.has(movieKey(movie.title, movie.yearOfRelease))
    );

    //5. Embed and insert only the new ones
    if(newMovies.length > 0){
        await embedAndInsertMovies(newMovies)
    }

};

const embedAndInsertMovies = async (movies) => {

    //Embed each chunk and attach metadata for Supabase
    const movieData = await Promise.all(

        movies.map(async (movie) => {

            const embeddingResponse = await openai.embeddings.create({
                model: OPENAI_EMBEDDING_MODEL,
                input: movie.content,
            });

            return {
                title: movie.title,
                year_of_release: movie.yearOfRelease,
                description: movie.description,
                content: movie.content,
                embedding: embeddingResponse.data[0].embedding
            };

        })
    );

    const { error } = await supabase.from('movienight_choice')
    .insert(movieData);

     if (error) {
        throw new Error(error.message || 'Error inserting rows into Supabase');
    }

}

const parseMatchContent = (content) => {
    const [header, ...descriptionParts] = content.split('|');
    const [titlePart, yearPart] = header.split(':');

    return {
        title: titlePart?.trim(),
        yearOfRelease: yearPart?.trim(),
        description: descriptionParts.join('|').trim(),
    };
};

const createAndStoreEmbeddings = async () => {

    const movies = await parseMovieEntry();
    await embedAndInsertMovies(movies)

    // 1. Parse movies.txt into structured objects
    // const movies = await parseMovieEntry();

    //Embed each chunk and attach metadata for Supabase
    // const movieData = await Promise.all(

    //     movies.map(async (movie) => {

    //         const embeddingResponse = await openai.embeddings.create({
    //             model: OPENAI_EMBEDDING_MODEL,
    //             input: movie.content,
    //         });

    //         return {
    //             title: movie.title,
    //             year_of_release: movie.yearOfRelease,
    //             description: movie.description,
    //             content: movie.content,
    //             embedding: embeddingResponse.data[0].embedding
    //         };

    //     })
    // );

    // await supabase.from('movienight_choice').insert(movieData);

    // if (error) {
    //     throw new Error(error.message || 'Error inserting rows into Supabase');
    // }

};

const getQueryEmbedding = async (text) => {
    const embeddingResponse = await openai.embeddings.create({
        model: OPENAI_EMBEDDING_MODEL,
        input: text,
    });
    return embeddingResponse.data[0].embedding;
};

const findNearestMatch = async (embedding, matchCount = 6) => {
    const { data, error } = await supabase.rpc('match_movienight_choice', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 6,
    });

    if (error) {
        throw new Error(error.message || 'Error finding nearest match');
    }

    if (!data?.[0]?.content) {
        throw new Error('No matching movie found');
    }

    return data;

};

const getChatCompletion = async (text, query) => {

    const chatMessages = [
        {
            role: 'system',
            content: `You are an enthusiastic movie expert who loves recommending movies to people. 
    You will be given the following pieces of information - the number of users, their available movie runtime, 
    their favorite movie and why they like it, their mood for something new or a classic, their preference for something 
    fun, inspiring, scary or serious and the famous person they would like to bewith and why.
    Your main job is to formulate a short answer to the questions using the provided context. 
    The answer should in this valid JSON object format, no markdown, no extra text. Give 6 movie recommendations.
    JSON shape: { "title": string, "description": string, "yearOfRelease": string }`,
        },
        {
            role: 'user',
            //content: JSON.stringify(combinedFinalResponses)
            content: `Context: ${text} Question: ${query}`,
        }
    ];

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${OPENAI_API_KEY}`,
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

    } catch (error) {
        console.error('Error getting movie poster:', error);

        throw error;
    }
};

export const getAIMovieResponses = async (finalResponses) => {

    await ensureEmbeddingsExist();

    const queryText = JSON.stringify(finalResponses);
    const queryEmbedding = await getQueryEmbedding(queryText);
    const matches = await findNearestMatch(queryEmbedding, 6);

    const seen = new Set();
    const recommendations = [];

    for (const movie of matches) {
        const parsed = parseMatchContent(movie.content);

        if (!parsed.title || seen.has(parsed.title)) continue;
        seen.add(parsed.title);

        recommendations.push(parsed);

        if (recommendations.length === 6) break;
    }

    console.log("Recommendations:", recommendations);

    return { recommendations };

};