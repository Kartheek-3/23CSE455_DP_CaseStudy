import { injectable } from "tsyringe";
import { v2 as cloudinary } from "cloudinary";
import crypto from 'crypto';
import { IFileStorageService } from "../../domain/services/IFileStorageService";
import { AuthError } from "../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

 export type SignedUrlResponse = {
  public_id: string;
  timestamp: number;
  signature: string;
  folder: string;
};
export type ChatSignedUrlResponse = {
  public_id: string;
  timestamp: number;
  signature: string;
  folder: string;
  resource_type: 'image' | 'raw';
  upload_preset: string;
}

@injectable()
export class CloudinaryFileStorageService implements IFileStorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async getSignedUrl(fileType: string, userId: string): Promise<SignedUrlResponse> {
    try {
      // ✅ Validate file type (only allow specific formats)
      if (!['image/png', 'image/jpeg', 'application/pdf'].includes(fileType)) {
        throw new Error("Invalid file type");
      }

      // ✅ Generate secure random filename
      const timestamp = Math.round(new Date().getTime() / 1000);
      const randomString = crypto.randomBytes(8).toString('hex'); 
      const publicId = `uploads/${userId}-${randomString}-${timestamp}`;
      // const transformation = "c_fill,w_600,h_600"; 
      // ✅ Dynamically assign folder based on file type
      const folder = fileType.startsWith('image/') ? 'images' : 'documents';

      // ✅ Generate a secure signature
      const signature = cloudinary.utils.api_sign_request(
        { folder, public_id: publicId, timestamp },
        process.env.CLOUDINARY_API_SECRET as string
      );

      return { public_id: publicId, timestamp, signature, folder };
    } catch (error) {
      throw new Error("Failed to generate signed URL for upload");
    }
  }

async chatSignedUrl(fileType: string, userId: string): Promise<ChatSignedUrlResponse> {
  try {
    const allowedTypes = [
      'image','pdf','doc'
    ];

    if (!allowedTypes.includes(fileType)) {
      throw new AuthError("Invalid file type",HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const randomString = crypto.randomBytes(8).toString('hex');
    const publicId = `uploads/${userId}-${randomString}-${timestamp}`;

    const isImage = fileType.startsWith('image/');
    const resourceType: 'image' | 'raw' = isImage ? 'image' : 'raw';
    const folder = isImage ? 'images' : 'documents';

    const upload_preset = 'ml_default'; // ✅ you’re using this in frontend

    const signature = cloudinary.utils.api_sign_request(
      {
        folder,
        public_id: publicId,
        timestamp,
        upload_preset, // important to sign this if using signed uploads
      },
      process.env.CLOUDINARY_API_SECRET as string
    );

    return { public_id: publicId, timestamp, signature, folder, resource_type: resourceType, upload_preset };
  } catch (error:any) {
    throw new AuthError("Failed to generate signed URL for upload",HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

}
