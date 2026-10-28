// import { injectable } from "tsyringe";
// import { v2 as cloudinary } from "cloudinary";
// import crypto from 'crypto';
// import { IFileStorageService } from "../../domain/services/IFileStorageService";

// export type SignedUrlResponse = {
//   public_id: string;
//   timestamp: number;
//   signature: string;
//   folder: string;
//   resource_type: 'image' | 'raw';
//   upload_preset: string;
// }


// @injectable()
// export class CloudinaryFileStorageService implements IFileStorageService {
//   constructor() {
//     cloudinary.config({
//       cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//       api_key: process.env.CLOUDINARY_API_KEY,
//       api_secret: process.env.CLOUDINARY_API_SECRET,
//     });
//   }
// async getSignedUrl(fileType: string, userId: string): Promise<SignedUrlResponse> {
//   try {
//     const allowedTypes = [
//       'image/png',
//       'image/jpeg',
//       'image/jpg',
//       'image/webp',
//       'image/gif',
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     ];

//     if (!allowedTypes.includes(fileType)) {
//       throw new Error("Invalid file type");
//     }

//     const timestamp = Math.round(new Date().getTime() / 1000);
//     const randomString = crypto.randomBytes(8).toString('hex');
//     const publicId = `uploads/${userId}-${randomString}-${timestamp}`;

//     const isImage = fileType.startsWith('image/');
//     const resourceType: 'image' | 'raw' = isImage ? 'image' : 'raw';
//     const folder = isImage ? 'images' : 'documents';

//     const upload_preset = 'ml_default'; // ✅ you’re using this in frontend

//     const signature = cloudinary.utils.api_sign_request(
//       {
//         folder,
//         public_id: publicId,
//         timestamp,
//         upload_preset, // important to sign this if using signed uploads
//       },
//       process.env.CLOUDINARY_API_SECRET as string
//     );

//     return { public_id: publicId, timestamp, signature, folder, resource_type: resourceType, upload_preset };
//   } catch (error) {
//     throw new Error("Failed to generate signed URL for upload");
//   }
// }

// }
