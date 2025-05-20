"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "123";
function auth(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        res.status(401).json({ message: "No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (typeof decoded === "string") {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        if (!decoded || !decoded.userId) {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        if (!req.user) {
            req.user = {};
        }
        req.user.id = decoded.userId;
        next();
    }
    catch (e) {
        res.status(411).json({ message: "Invalid token" });
    }
}
