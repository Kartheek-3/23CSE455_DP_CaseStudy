import { injectable, inject } from "tsyringe";
import { IFileStorageService } from "../../domain/services/IFileStorageService";
import { TOKENS } from "../../constants/Tokens";
import { IGenerateSignedUrlUseCase } from "./Interfaces/IGenerateSignedUrlUseCase";
import { SignedUrlResponse } from "../../infrastructure/services/cloudstorageservice";

@injectable()
export class GenerateSignedUrl implements IGenerateSignedUrlUseCase  {
  constructor(
    @inject(TOKENS.FILE_SERVICE) private _fileStorageService: IFileStorageService
  ) {}

  async execute(fileType: string, fileName: string):Promise<SignedUrlResponse>{
    if (!fileType || !fileName) {
      throw new Error("File type and file name are required");
    }

    return this._fileStorageService.getSignedUrl(fileType, fileName);
  }
}
