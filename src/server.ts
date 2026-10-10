
import { app } from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.port, () => {
    console.log( `Server running at http://localhost:${env.port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
});
