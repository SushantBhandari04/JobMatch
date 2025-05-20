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
exports.formatUserProfile = formatUserProfile;
exports.formatJobToText = formatJobToText;
exports.embedAndStoreMultipleJobs = embedAndStoreMultipleJobs;
const cohere_1 = require("./cohere");
const pinecone_1 = require("./pinecone");
const jobs_1 = require("./jobs");
const jobsPromise = (0, jobs_1.getJobs)();
function formatUserProfile(profile) {
    return `
Title: ${profile.title}
Location: ${profile.location}
Years of Experience: ${profile.yearsOfExperience}
Experience Level: ${profile.experienceLevel}
Remote Preference: ${profile.remotePreference}
Skills: ${profile.skills.join(", ")}
Preferred Job Types: ${profile.preferredJobTypes.join(", ")}
Bio: ${profile.bio}
`.trim();
}
function formatJobToText(job) {
    return `
    ${job.title}
    Company: ${job.company}
    Location: ${job.location}
    Type: ${job.type} (${job.remote ? "Remote" : job.hybrid ? "Hybrid" : "Onsite"})
    Experience: ${job.experience}
    Description: ${job.description}
    Responsibilities: ${job.responsibilities.join(", ")}
    Requirements: ${job.requirements.join(", ")}
    Skills: ${job.skills.join(", ")}
  `.trim();
}
function embedAndStoreMultipleJobs() {
    return __awaiter(this, void 0, void 0, function* () {
        const jobs = yield jobsPromise;
        const vectors = yield Promise.all(jobs.map((job) => __awaiter(this, void 0, void 0, function* () {
            const text = formatJobToText(job);
            const embedding = yield (0, cohere_1.getEmbedding)(text);
            //   console.log(`Embedding : ${embedding}`);
            return {
                id: String(job.id),
                values: embedding,
                metadata: {
                    title: job.title,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    experience: job.experience,
                    remote: job.remote,
                    hybrid: job.hybrid,
                    skills: job.skills,
                },
            };
        })));
        yield pinecone_1.jobIndex.upsert(vectors);
        console.log(`✅ ${vectors.length} jobs embedded and uploaded to Pinecone.`);
    });
}
embedAndStoreMultipleJobs();
