import AWS from "aws-sdk";
import { StorageService } from "../../../types";
import { ENV } from "../../../config/env";
export class S3StorageService implements StorageService {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
      region: ENV.AWS_REGION,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucketName = ENV.S3_BUCKET_NAME;

    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME environment variable is not set");
    }

    console.log(bucketName);
    const params = {
      Bucket: bucketName,
      Key: `uploads/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const result = await this.s3.upload(params).promise();
    return result.Location; // Return S3 file URL
  }

  async deleteFileFromCloudStorage(fileUrl: string) {
    const bucketName = process.env.S3_BUCKET_NAME;

    // Ensure bucket name is defined
    if (!bucketName) {
      throw new Error("S3 bucket name is not defined");
    }

    const key = fileUrl.split("/").slice(-1).join("/");
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await this.s3.deleteObject(params).promise();
      console.log(`Successfully deleted ${fileUrl} from S3`);
    } catch (error) {
      console.error(`Failed to delete ${fileUrl} from S3`, error);
      throw new Error(`Error deleting file from cloud storage: ${error}`);
    }
  }
}
