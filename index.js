const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const INDEX_PATH = path.join(__dirname, "index.html");

const server = http.createServer(async (req, res) => {
    // Serve static HTML file
    if (req.method === "GET" && req.url === "/") {
        serveStaticFile(res, INDEX_PATH, "text/html");
        return;
    }

    // Handle favicon requests
    if (req.method === "GET" && req.url === "/favicon.ico") {
        res.writeHead(204);
        res.end();
        return;
    }

    // Handle file metadata endpoint
    if (req.method === "POST" && req.url === "/api/fileanalyse") {
        handleFileUpload(req, res);
        return;
    }

    // Handle 404 for other routes
    res.writeHead(404);
    res.end();
});

function serveStaticFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end("Error loading file");
            return;
        }

        res.writeHead(200, {
            "Content-Type": contentType,
            "Cache-Control": "no-cache",
        });
        res.end(data);
    });
}

function handleFileUpload(req, res) {
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.startsWith("multipart/form-data")) {
        sendError(res, 400, "Invalid content type");
        return;
    }

    const boundary = contentType.split("boundary=")[1];
    if (!boundary) {
        sendError(res, 400, "Missing boundary in content type");
        return;
    }

    let body = [];
    req.on("data", (chunk) => {
        body.push(chunk);
    })
        .on("end", () => {
            try {
                const fullBody = Buffer.concat(body).toString();
                const parts = fullBody.split(`--${boundary}`);

                const filePart = parts.find((part) =>
                    part.includes('Content-Disposition: form-data; name="file"')
                );

                if (!filePart) {
                    sendError(res, 400, "No file uploaded");
                    return;
                }

                const filenameMatch = filePart.match(/filename="([^"]+)"/);
                const contentTypeMatch = filePart.match(
                    /Content-Type: ([^\r\n]+)/
                );
                const fileContent = filePart.split("\r\n\r\n")[1].trim();

                const getSize = () => {
                    size = Buffer.byteLength(fileContent);
                    size > 1024 ? `${size / 1024} KB` : `{size} bytes`;
                };

                const metadata = {
                    name: filenameMatch ? filenameMatch[1] : "unknown",
                    type: contentTypeMatch
                        ? contentTypeMatch[1]
                        : "application/octet-stream",
                    size: getSize(),
                };

                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(metadata));
            } catch (err) {
                sendError(res, 500, "Error processing file");
            }
        })
        .on("error", (err) => {
            sendError(res, 500, "Server error");
        });
}

function sendError(res, code, message) {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
}

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Serving static file from: ${INDEX_PATH}`);
});
