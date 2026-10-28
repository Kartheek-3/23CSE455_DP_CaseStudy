import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";
import { USECASE_TOKENS } from "../../constants/UseCaseTokens";
import { IGenerateSignedUrlUseCase } from "../../application/use_cases/Interfaces/IGenerateSignedUrlUseCase";
import { ZodHelper } from "../schemas/common/ZodHelper";
import { GetSignedUrlSchema } from "../schemas/common/FileRequestDTO";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { catchAsync } from "../../infrastructure/utils/catchAsync";

@injectable()
export class FileController {
  constructor(
    @inject(USECASE_TOKENS.GENERATE_SIGNED_URL_USECASE)
    private _generateSignedUrlUseCase: IGenerateSignedUrlUseCase
  ) {}

  getSignedUrl = catchAsync(async (req: Request, res: Response) => {
    // 1. DTO Validation
    const { fileType, fileName } = ZodHelper.validate(GetSignedUrlSchema, req.query);

    // 2. Execute
    const signedUrlResponse = await this._generateSignedUrlUseCase.execute(fileType, fileName);

    return res.status(HTTP_STATUS_CODES.CREATED).json({ signedUrl: signedUrlResponse });
  });
}
