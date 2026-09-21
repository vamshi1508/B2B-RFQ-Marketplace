const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Validate required fields
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // 2. Validate role
        if (role !== "BUYER" && role !== "SUPPLIER") {
            return res.status(400).json({
                message: "Role must be BUYER or SUPPLIER"
            });
        }

        // 3. Check whether email already exists
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(409).json({
                message: "Email already registered"
            });
        }

        // 4. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Insert user into database
        const [result] = await db.query(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role]
        );

        // 6. Send response
        res.status(201).json({
            message: "User registered successfully",
            user: {
                id: result.insertId,
                name,
                email,
                role
            }
        });

    } catch (error) {
        console.error("Registration error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // 2. Find user by email
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // 3. Compare password with stored bcrypt hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // 4. Create JWT token
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // 5. Send response
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error.message);

        res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    register,
    login
};