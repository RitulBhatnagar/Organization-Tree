import "reflect-metadata";
import express, { Application } from "express";
import { initializeSocket } from "./socket";
import logger from "./utils/logger";
import "./listeners/taskEventListeners";
import { AppDataSource } from "./config/data-source";
import { createServer, Server as HttpServer } from "http";
import { ENV } from "./config/env";
import nodeRoutes from "./routes/v1/node.routes";
import adminRoutes from "./routes/v1/admin.routes";
import userLoginRoutes from "./routes/v1/userLogin.routes";
import brandManagementRoutes from "./routes/v1/brandManagment.routes";
import teamManagementRoutes from "./routes/v1/teamMangement.routes";
import userRoutes from "./routes/v1/user.routes";
import taskRoutes from "./routes/v1/task.routes";
import commentRoutes from "./routes/v1/comment.routes";
import taskHistoryRoutes from "./routes/v1/taskHistory.routes";
import taskAnalyticsRoutes from "./routes/v1/taskAnalytics.routes";
import notificationRoutes from "./routes/v1/notifcation.routes";
import eventRoutes from "./routes/v1/event.routes";
import inventoryRoutes from "./routes/v1/inventory.routes";
import collaboratorRoutes from "./routes/v1/collaborator.routes";
import { startCronJobs } from "./config/cron";

// Initialize Express App
const app: Application = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});
// JSON body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
// Base route
app.get("/", (req, res) => res.send("Hello, World!"));

const routes = [
  { path: "node", router: nodeRoutes },
  { path: "auth", router: userLoginRoutes },
  { path: "admin", router: adminRoutes },
  { path: "brand", router: brandManagementRoutes },
  { path: "team", router: teamManagementRoutes },
  { path: "user", router: userRoutes },
  { path: "task", router: taskRoutes },
  { path: "comment", router: commentRoutes },
  { path: "task-history", router: taskHistoryRoutes },
  { path: "task-analytics", router: taskAnalyticsRoutes },
  { path: "notification", router: notificationRoutes },
  { path: "event", router: eventRoutes },
  { path: "inventory", router: inventoryRoutes },
  { path: "collaborators", router: collaboratorRoutes },
];
routes.forEach(({ path, router }) => {
  app.use(`/api/v${ENV.version}`, router);
});

// Database Initialization and Server Startup
AppDataSource.initialize()
  .then(() => {
    logger.info("Data Source has been initialized!");

    // start the cron job services
    startCronJobs();

    // intialize socket io server
    const server: HttpServer = createServer(app);

    initializeSocket(server);

    server.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });

    // swaggerDocs(app, port);
  })
  .catch((err) => {
    logger.error("Error during Data Source initialization:", err);
  });
