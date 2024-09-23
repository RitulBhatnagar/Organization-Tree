import "reflect-metadata";
import logger from "./utils/logger";
import express, { Application, Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json";
import { AppDataSource } from "./config/data-source";
import { createServer, Server as HttpServer } from "http";
import { ENV } from "./config/env";

const app: Application = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const options = {
  swaggerDefinition: swaggerDocument,
  apis: ["./src/routes/*.ts", "./src/models/*.ts"], // Path to the API docs
};

const specs = swaggerJsdoc(options);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);
app.use(express.json({ limit: "50mb" }));

// Routes
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// Connect to the database
AppDataSource.initialize()
  .then(() => {
    logger.info("Data Source has been initialized!");

    const server: HttpServer = createServer(app);

    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
