import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import db from "./database.js";

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from server/.env");
}

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());


// --------------------------------------------------
// TEST ROUTE
// --------------------------------------------------

app.get("/api/health", (request, response) => {
    response.json({
        success: true,
        message: "Pizza ordering backend is running."
    });
});


// --------------------------------------------------
// REGISTER CUSTOMER
// --------------------------------------------------

app.post("/api/auth/register", async (request, response) => {
    try {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return response.status(400).json({
                success: false,
                message: "Name, email, and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = db
            .prepare("SELECT id FROM users WHERE email = ?")
            .get(normalizedEmail);

        if (existingUser) {
            return response.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        if (password.length < 8) {
            return response.status(400).json({
                success: false,
                message: "Password must contain at least 8 characters."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        /*
         * Important:
         * Public registrations are always assigned customer access.
         * We do not accept a role from the browser.
         */
        const result = db.prepare(`
            INSERT INTO users (
                name,
                email,
                password_hash,
                role
            )
            VALUES (?, ?, ?, 'customer')
        `).run(
            name.trim(),
            normalizedEmail,
            passwordHash
        );

        return response.status(201).json({
            success: true,
            message: "Customer account created successfully.",
            user: {
                id: result.lastInsertRowid,
                name: name.trim(),
                email: normalizedEmail,
                role: "customer"
            }
        });
    } catch (error) {
        console.error("Registration error:", error);

        return response.status(500).json({
            success: false,
            message: "Unable to create the account."
        });
    }
});


// --------------------------------------------------
// LOGIN
// --------------------------------------------------

app.post("/api/auth/login", async (request, response) => {
    try {
        const { email, password } = request.body;

        if (!email || !password) {
            return response.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = db.prepare(`
            SELECT
                id,
                name,
                email,
                password_hash,
                role
            FROM users
            WHERE email = ?
        `).get(normalizedEmail);

        if (!user) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return response.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        return response.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return response.status(500).json({
            success: false,
            message: "Unable to log in."
        });
    }
});


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});