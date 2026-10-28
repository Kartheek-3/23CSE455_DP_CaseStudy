import { SignedUrlResponse } from "../../../infrastructure/services/cloudstorageservice";

export interface IGenerateSignedUrlUseCase {
  execute(fileType: string, fileName: string):Promise<SignedUrlResponse>;
}
