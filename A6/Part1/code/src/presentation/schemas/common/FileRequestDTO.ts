import { z } from "zod";

/**
 * Get Signed URL Request Schema (Query Params)
 */
export const GetSignedUrlSchema = z.object({
  fileType: z.string().min(1, "File type is required"),
  fileName: z.string().min(1, "File name is required"),
});

export type GetSignedUrlRequest = z.infer<typeof GetSignedUrlSchema>;
