"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobIndex = exports.pinecone = void 0;
const pinecone_1 = require("@pinecone-database/pinecone");
exports.pinecone = new pinecone_1.Pinecone({
    apiKey: `${process.env.PINECONE_API_KEY}`,
});
exports.jobIndex = exports.pinecone.index(`${process.env.PINECONE_INDEX_NAME}`);
