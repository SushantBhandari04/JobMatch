"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEmbedding = getEmbedding;
const cohere_ai_1 = require("cohere-ai");
const cohere = new cohere_ai_1.CohereClient({
    token: `${process.env.COHERE_API_KEY}`,
});
function getEmbedding(text) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const response = yield cohere.v2.embed({
            texts: [text],
            model: "embed-v4.0",
            inputType: "search_document",
            embeddingTypes: ["float"],
        });
        return ((_b = (_a = response.embeddings) === null || _a === void 0 ? void 0 : _a.float) === null || _b === void 0 ? void 0 : _b[0]) || [];
    });
}
