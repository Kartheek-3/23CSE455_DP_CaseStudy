import { injectable, inject } from "tsyringe";
import { IFileStorageService } from "../../domain/services/IFileStorageService";
import { AuthError } from "../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { TOKENS } from "../../constants/Tokens";

@injectable()
export class GenerateChatSignedUrl {
  constructor(
    @inject(TOKENS.FILE_SERVICE) private _fileStorageService: IFileStorageService
  ) {}

  async execute(fileType: string,userId:string) {
    if (!fileType || !userId) {
      throw new AuthError("File type and userId are requires",HTTP_STATUS_CODES.BAD_REQUEST);
    }

    return this._fileStorageService.chatSignedUrl(fileType,userId)
  }
}
