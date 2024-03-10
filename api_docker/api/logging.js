import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logRequest = (req, res, next) => {
    const oldWrite = res.write;
    const oldEnd = res.end;

    const chunks = [];

    res.write = function (chunk, ...args) {
        chunks.push(chunk);
        return oldWrite.apply(res, [chunk, ...args]);
    };

    res.end = function (chunk, ...args) {
        if (chunk) {
            chunks.push(chunk);
        }
        const responseBody = Buffer.concat(chunks).toString("utf8");

        logToFile(req, responseBody);
        oldEnd.apply(res, [chunk, ...args]);
    };

    next();
};

const logToFile = (req, responseBody) => {
    const now = new Date();
    const logEntry = `
        Time: ${now.toISOString()}
        Endpoint: ${req.originalUrl}
        Method: ${req.method}
        Payload: ${JSON.stringify(req.body)}
        Response: ${responseBody}
        ------------------------------
    `;

    fs.appendFile(path.join(__dirname, "log.txt"), logEntry, err => {
        if (err) {
            console.error("Error writing to log file", err);
        }
    });
};

export { logRequest };
