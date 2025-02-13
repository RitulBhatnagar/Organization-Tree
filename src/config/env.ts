import dotenvSafe from "dotenv-safe";
import logger from "../utils/logger";

dotenvSafe.config({
  example: ".env.example",
  allowEmptyValues: false,
  path: ".env",
});

interface Env {
  NODE_ENV: "dev" | "prod" | "test";
  PORT: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  version: number;
  STORAGE_PROVIDER: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_REGION: string;
  S3_BUCKET_NAME: string;
}

export const ENV: Env = {
  NODE_ENV: (process.env.NODE_ENV as "dev" | "prod" | "test") || "prod",
  PORT: process.env.PORT || "",
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_PORT: process.env.DB_PORT || "5432",
  JWT_SECRET: process.env.JWT_SECRET || "secret",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "7d",
  DB_USERNAME: process.env.DB_USERNAME || "your_DB_USERNAME",
  DB_PASSWORD: process.env.DB_PASSWORD || "your_db_password",
  DB_DATABASE: process.env.DB_DATABASE || "your_db_name",
  version: parseInt(process.env.VERSION || "1"),
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || "s3",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  AWS_REGION: process.env.AWS_REGION || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
};

// Update the requiredVars to match the actual keys in the Env interface
const requiredVars = [
  "NODE_ENV",
  "PORT",
  "DB_HOST",
  "DB_PORT",
  "DB_USERNAME",
  "DB_PASSWORD",
  "DB_DATABASE",
] as const;

requiredVars.forEach((key) => {
  if (!ENV[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

// Validate NODE_ENV
if (
  ENV.NODE_ENV !== "dev" &&
  ENV.NODE_ENV !== "prod" &&
  ENV.NODE_ENV !== "test"
) {
  throw new Error(
    `Invalid value for NODE_ENV: ${ENV.NODE_ENV}. Allowed values are 'dev', 'test' or 'prod'.`
  );
}
