import { compile } from "html-to-text";
import { RecursiveUrlLoader } from "langchain/document_loaders/web/recursive_url";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const url = "https://lbb.in/delhi";

const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

const loader = new RecursiveUrlLoader(url, {
  extractor: compiledConvert,
  maxDepth: 1000,
  excludeDirs: [
    "https://lbb.in/mumbai",
    "https://lbb.in/bangalore",
    "https://lbb.in/all/post/goa",
    "https://lbb.in/all/post/kochi",
    "https://lbb.in/hyderabad",
  ],
});

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter();
const output = await splitter.splitDocuments(docs);

console.log(output);
