import "reflect-metadata";
import express, { Application } from "express";
import logger from "./utils/logger";
import { AppDataSource } from "./config/data-source";
import { createServer, Server as HttpServer } from "http";
import { ENV } from "./config/env";
import nodeRoutes from "./routes/v1/node.routes";
import adminRoutes from "./routes/v1/admin.routes";
import userLoginRoutes from "./routes/v1/userLogin.routes";
import brandManagementRoutes from "./routes/v1/brandManagment.routes";
import teamManagementRoutes from "./routes/v1/teamMangement.routes";
import userRoutes from "./routes/v1/user.routes";
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

// authentication routes
app.use(`/api/v${ENV.version}`, userLoginRoutes);

// admin routes
app.use(`/api/v${ENV.version}`, adminRoutes);

// brand management routes
app.use(`/api/v${ENV.version}`, brandManagementRoutes);

// team management routes
app.use(`/api/v${ENV.version}`, teamManagementRoutes);

// basic user routes
app.use(`/api/v${ENV.version}`, userRoutes);

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
