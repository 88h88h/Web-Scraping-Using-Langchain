import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import dotenv from "dotenv";
dotenv.config();

const url = "https://lbb.in/delhi";

const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

const loader = new RecursiveUrlLoader(url, {
  extractor: compiledConvert,
  maxDepth: 1,
  excludeDirs: [
    "https://lbb.in/mumbai",
    "https://lbb.in/bangalore",
    "https://lbb.in/all/post/goa",
    "https://lbb.in/all/post/kochi",
    "https://lbb.in/hyderabad",
  ],
});

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  separators: ["\n\n", "\n", " ", ""],
  chunkOverlap: 50,
});
const output = await splitter.splitDocuments(docs);

const sbApiKey = process.env.SUPABASE_API_KEY;
const sbUrl = process.env.SUPABASE_URL;
const openAIApiKey = process.env.OPENAI_API_KEY;

const client = createClient(sbUrl, sbApiKey);

await SupabaseVectorStore.fromDocuments(
  output,
  new OpenAIEmbeddings({ openAIApiKey }),
  {
    client,
    tableName: "documents",
  }
);
