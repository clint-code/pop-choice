import { openai, supabase } from './config.js';
import popchoice_movies from './content.js';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

//spilt moves.txt into text chunks
async function splitDocument(document){
    const response = await fetch (document);
    const text = await response.text();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 250,
        chunkOverlap: 20,
    });

    const output = await splitter.createDocuments([text]);

    return output;
}

async function createAndStoreEmbeddings() {

    const chunkData = await splitDocument('movies.txt');

    const movieData = await Promise.all(
        chunkData.map( async (chunk) => {
            const embeddingResponse = await openai.embeddings.create({
                model: "text-embedding-ada-002",
                input: chunk.pageContent
            });
            
            return {
                content: chunk.pageContent,
                embedding: embeddingResponse.data[0].embedding
            }
        })
        

    );
    await supabase.from('popchoice_movies').insert(movieData);
    console.log('Embedding and storing complete! Woohoo!!');

}

createAndStoreEmbeddings();

// async function main(input){

//     const movieData = await Promise.all(
//         input.map( async (textChunk) => {
//             const embeddingResponse = await openai.embeddings.create({
//                 model: "text-embedding-ada-002",
//                 input: textChunk
//             });
//             return {
//                 content: textChunk,
//                 embedding: embeddingResponse.data[0].embedding
//             }
//         })

//     );

//     //insert movie content and embedding into Supabase
//     await supabase.from('popchoice_movies').insert(movieData);
//     console.log('Embedding and storing complete! Woohoo!!');
// }

// main(popchoice_movies)