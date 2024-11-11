import dotenv from "dotenv";
import logger from "../src/utils/logger";

dotenv.config({ path: ".env.test" });

// You can add more setup code here if needed
logger.info("Test environment setup completed");
