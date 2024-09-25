import "reflect-metadata";
import express, { Application } from "express";
import logger from "./utils/logger";
import { AppDataSource } from "./config/data-source";
import { createServer, Server as HttpServer } from "http";
import { ENV } from "./config/env";
import nodeRoutes from "./routes/node.routes";
import swaggerDocs from "./utils/swagger";

// Initialize Express App
const app: Application = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// JSON body parser middleware
app.use(express.json({ limit: "50mb" }));

// Base route
app.get("/", (req, res) => res.send("Hello, World!"));

// Node routes
app.use(`/api/v${ENV.version}/node`, nodeRoutes);

// Database Initialization and Server Startup
AppDataSource.initialize()
  .then(() => {
    logger.info("Data Source has been initialized!");

    const server: HttpServer = createServer(app);
    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    swaggerDocs(app, port);
  })
  .catch((err) => {
    logger.error("Error during Data Source initialization:", err);
  });
