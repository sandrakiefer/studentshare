const functions = require("@google-cloud/functions-framework");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mysql = require("mysql");
const fs = require("fs");
const fetch = require("node-fetch");

// Load config
dotenv.config({ path: "./config.env" });
const privateKey = fs.readFileSync("./keys/StudentSharePrivate.key");

const pool = mysql.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`,
});

// Check if users table exists in database, otherwise create it
pool.query("show tables", (error, results) => {
    if (!results.includes("users"))
        pool.query(
            "CREATE TABLE users (email varchar(255) unique, name varchar(255), courses varchar(255))"
        );
});

functions.http("users", async (req, res) => {
    res.set("Access-Control-Allow-Origin", "https://website-dot-studentshare.ey.r.appspot.com");
    // res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
        // Send response to OPTIONS requests
        res.set("Access-Control-Allow-Methods", "GET,POST");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Max-Age", "3600");
        res.status(204).send("");
    } else {
        const path = req.path;
        switch (path) {
            case "/login":
                await handleLogin(req, res);
                break;
            case "/isRegistered":
                handleIsRegistered(req, res);
                break;
            default:
                // invalid path
                res.status(404).json({ message: "Requested path not found" });
                break;
        }
    }
});

async function getData(url) {
    const response = await fetch(url);
    return response.json();
}

const handleLogin = async (req, res) => {
    if (req.method === "POST") {
        let userEmail;
        let userName;
        let userCourses;
        // Extract data from request body
        let googleToken = req.body.token;
        const googleCertificateUrl = "https://www.googleapis.com/oauth2/v1/certs";
        let googleCertificates = await getData(googleCertificateUrl);
        // Check if Google SignIn JWT is valid
        try {
            const kid = jwt.decode(googleToken, { complete: true }).header.kid;
            var decoded = jwt.verify(googleToken, googleCertificates[kid], { algorithms: ["RS256"] });
            userEmail = decoded.email;
            userName = decoded.name;
        } catch (err) {
            // Unauthorized Request forbidden
            res.status(401).json({ message: "Unauthorized Request: Invalid Google JWT" });
            return;
        }
        // Check if user already exists in database
        pool.query(
            `SELECT * FROM users WHERE email = '${userEmail}'`,
            (error, results) => {
                if (!results[0]) {
                    // Add user to database
                    userCourses = req.body.courses;
                    pool.query(`INSERT INTO users (email, name, courses) VALUES ('${userEmail}', '${userName}', '${userCourses}')`);
                } else {
                    // Get courses from database
                    userCourses = results[0].courses;
                }
                // Generate JWT and return it
                const newJWT = jwt.sign(
                    {
                        email: userEmail,
                        sub: userEmail,
                        name: userName,
                        courses: userCourses,
                        iss: "StudentShare",
                        aud: "https://www.studentshare.de",
                    },
                    privateKey,
                    { algorithm: "RS256", expiresIn: "24h" }
                );
                res.status(200).json({ token: newJWT });
            }
        );
    } else {
        // Request method not allowed
        res.status(405).json({ message: "Method Not Allowed" });
    }
};

const handleIsRegistered = (req, res) => {
    if (req.method === "GET") {
        const email = req.query.email;
        // Check if user already exists in database
        pool.query(
            `SELECT * FROM users WHERE email = '${email}'`,
            (error, results) => {
                if (!results[0]) {
                    res.status(200).json({ data: "false" });
                } else {
                    res.status(200).json({ data: "true" });
                }
            }
        );
    } else {
        // Request method not allowed
        res.status(405).json({ message: "Method Not Allowed" });
    }
};
