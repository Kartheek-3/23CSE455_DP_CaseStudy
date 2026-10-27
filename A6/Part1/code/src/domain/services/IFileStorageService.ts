import { SignedUrlResponse,ChatSignedUrlResponse } from "../../infrastructure/services/cloudstorageservice";

export interface IFileStorageService {
  getSignedUrl(fileType: string, userId: string): Promise<SignedUrlResponse>;
  chatSignedUrl(fileType:string,userId:string):Promise<ChatSignedUrlResponse>;
}
