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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("./db");
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const middleware_1 = require("./middleware");
const cohere_1 = require("./cohere");
const pinecone_1 = require("./pinecone");
const embed_jobs_1 = require("./embed-jobs");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true
}));
const JWT_SECRET = process.env.JWT_SECRET || "123";
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        res.json({
            message: "Invalid inputs"
        });
        return;
    }
    const hashedPassword = yield bcrypt_1.default.hash(password, 5);
    try {
        const user = yield db_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        res.json({
            id: user.id
        });
    }
    catch (_a) {
        res.status(411).json({
            message: "User already exists."
        });
    }
    res.json({
        message: "Signed up successfully"
    });
}));
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.json({
            message: "Invalid inputs"
        });
        return;
    }
    const user = yield db_1.prisma.user.findFirst({
        where: {
            email
        }
    });
    if (!user) {
        res.status(403).json({
            message: "User does not exist."
        });
        return;
    }
    const comparePassword = yield bcrypt_1.default.compare(password, user.password);
    if (!comparePassword) {
        res.status(403).json({
            message: "Incorrect password."
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({
        userId: user.id
    }, JWT_SECRET);
    res.json({
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        }
    });
}));
const profileSchema = zod_1.z.object({
    title: zod_1.z.string().min(2),
    location: zod_1.z.string().min(2),
    yearsOfExperience: zod_1.z.number().min(0),
    experienceLevel: zod_1.z.string(),
    bio: zod_1.z.string().min(10),
    skills: zod_1.z.array(zod_1.z.string()).min(1),
    preferredJobTypes: zod_1.z.array(zod_1.z.string()).min(1),
    remotePreference: zod_1.z.string(),
});
app.post('/profile/create', middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Assume authentication middleware sets req.user
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Validate incoming request body
        const parsed = profileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors });
            return;
        }
        const { title, location, yearsOfExperience, experienceLevel, bio, skills, preferredJobTypes, remotePreference, } = parsed.data;
        const newProfile = yield db_1.prisma.userProfile.create({
            data: {
                userId,
                title,
                location,
                yearsOfExperience,
                experienceLevel,
                bio,
                skills,
                preferredJobTypes,
                remotePreference,
            },
        });
        console.log('Profile created:', newProfile);
        res.status(201).json(newProfile);
    }
    catch (error) {
        console.error('Error creating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
// Create a partial schema for optional updates
const updateProfileSchema = profileSchema.partial();
app.put('/profile/update', middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        // Validate only provided fields
        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.errors });
            return;
        }
        const updateData = parsed.data;
        // Check if profile exists
        const existingProfile = yield db_1.prisma.userProfile.findUnique({
            where: { userId },
        });
        if (!existingProfile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }
        // Update only provided fields
        const updatedProfile = yield db_1.prisma.userProfile.update({
            where: { userId },
            data: updateData,
        });
        console.log('Profile updated:', updatedProfile);
        res.status(200).json(updatedProfile);
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.get('/profile', middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const profile = yield db_1.prisma.userProfile.findFirst({
            where: { userId },
        });
        if (!profile) {
            res.json({ message: 'Profile not found' });
            return;
        }
        console.log('Profile fetched:', profile);
        res.json(profile);
    }
    catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}));
app.get("/job-matches", middleware_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        // Step 1: Fetch the user profile from DB
        const profile = yield db_1.prisma.userProfile.findFirst({
            where: { userId },
        });
        if (!profile) {
            res.status(404).json({ error: "Profile not found" });
            return;
        }
        const text = (0, embed_jobs_1.formatUserProfile)(profile);
        const embedding = yield (0, cohere_1.getEmbedding)(text);
        const result = yield pinecone_1.jobIndex.query({
            vector: embedding,
            topK: 3,
            includeMetadata: true,
        });
        const matches = (_c = (_b = result.matches) === null || _b === void 0 ? void 0 : _b.map((match) => (Object.assign({ id: match.id, score: match.score }, match.metadata)))) !== null && _c !== void 0 ? _c : [];
        res.json({ matches });
    }
    catch (err) {
        console.error("Job matching error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.get("/jobs", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const jobs = yield db_1.prisma.job.findMany();
    res.json(jobs);
}));
app.listen(`${process.env.PORT}`, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
