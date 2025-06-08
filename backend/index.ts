import dotenv from "dotenv";

dotenv.config();

import Server from "./src/server";

async function startServer(): Promise<void> {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
  const server = new Server(port);

  try {
    await server.start();
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error);
    process.exit(1);
  }
}

startServer();
