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

    const { data, error } = await supabase
    .from('popchoice_movies')
    .upsert(movieData, { onConflict: 'content_hash' });

};

export const getAIMovieResponses = async (combinedFinalResponses) => {

    await createAndStoreEmbeddings();

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
            content: JSON.stringify(combinedFinalResponses)
        }
    ];

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

    //     const data = await response.json();
    //     console.log("Data from AI Response:",data);

    //     if (!response.ok) {
    //         throw new Error(`OpenAI request failed (${response.status})`);
    //     }

    //     return JSON.parse(data.choices[0].message.content);

    // } catch (error) {
    //     console.error('Error getting movie poster:', error);

    //     throw error;
    // }

};