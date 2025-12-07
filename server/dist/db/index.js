"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPgVersion = getPgVersion;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const serverless_1 = require("@neondatabase/serverless");
const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;
const connectionString = `postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=require`;
const sql = (0, serverless_1.neon)(connectionString);
async function getPgVersion() {
    try {
        const result = await sql `SELECT version()`;
        console.log("✅ Database version:", result[0]);
        return result[0];
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        throw error;
    }
}
