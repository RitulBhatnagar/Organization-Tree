import { ENV } from "../../../config/env";
import { StorageService } from "../../../types";
import { S3StorageService } from "./s3.service";

export class StorageServiceFactory {
  static createStorageService(): StorageService {
    const provider = ENV.STORAGE_PROVIDER;

    if (provider === "s3") {
      return new S3StorageService();
    }

    throw new Error(`Unsupported storage provider: ${provider}`);
  }
}
