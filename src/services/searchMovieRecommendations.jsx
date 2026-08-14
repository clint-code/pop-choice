import { openai, supabase } from '../config.js';
import { OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL } from '../config-keys.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

const splitDocument = async (documentToSplit) => {
    const response = await fetch(documentToSplit);
    const text = await response.text();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 150,
        chunkOverlap: 15
    });

    const splitText = await splitter.createDocuments([text]);

    return splitText;
};

const createAndStoreEmbeddings = async () => {
    const movieChunkData = await splitDocument('./movies.txt');

    const movieData = await Promise.all(

        movieChunkData.map(async (chunk) => {
            const embeddingResponse = await openai.embeddings.create({
                model: OPENAI_EMBEDDING_MODEL,
                input: chunk.pageContent,
            });

            return {
                content: chunk.pageContent,
                embedding: embeddingResponse.data[0].embedding
            };

        })
    );

    // const { data, error } = await supabase
    //     .from('match_movienight_choice')
    //     .upsert(movieData, { onConflict: 'unique_content_hash' });

    await supabase.from('movienight_choice').insert(movieData);
    console.log("Embedding and storing is COMPLETE!");
};

const getQueryEmbedding = async (text) => {
    const embeddingResponse = await openai.embeddings.create({
        model: OPENAI_EMBEDDING_MODEL,
        input: text,
    });
    return embeddingResponse.data[0].embedding;
};

const findNearestMatch = async (embedding) => {
    const { data, error } = await supabase.rpc('match_movienight_choice', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: 1,
    });

    console.log("Embedding:", embedding);

    console.log("Nearest match data:", data);

    if (error) {
        throw new Error(error.message || 'Error finding nearest match');
    }

    if (!data?.[0]?.content) {
        throw new Error('No matching movie found');
    }

    return data[0].content;

};

const getChatCompletion = async (text, query) => {
    console.log("Get chat completion, Text:", text);
    console.log("Get chat completion, Query", query);

    const chatMessages = [
        {
            role: 'system',
            content: `You are an enthusiastic movie expert who loves recommending movies to people. 
    You will be given the following pieces of information - the number of users, their available movie runtime, 
    their favorite movie and why they like it, their mood for something new or a classic, their preference for something 
    fun, inspiring, scary or serious and the famous person they would like to bewith and why.
    Your main job is to formulate a short answer to the questions using the provided context. 
    The answer should in this valid JSON object format, no markdown, no extra text.
    JSON shape: { "title": string, "description": string }`,
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
                response_format: {type: 'json_object'},
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

    const queryText = JSON.stringify(finalResponses);
    const queryEmbedding = await getQueryEmbedding(queryText);
    const match = await findNearestMatch(queryEmbedding);

    console.log("Match:", match);
    console.log("Query:", queryText);
    console.log("Query embedding:", queryEmbedding);

    return getChatCompletion(match, queryText);

};