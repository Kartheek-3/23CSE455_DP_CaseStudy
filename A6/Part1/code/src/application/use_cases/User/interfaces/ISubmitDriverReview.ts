import { SubmitReviewRequestDto, ReviewResponseDto } from "../../../dto/review/ReviewDto";

export interface ISubmitDriverReview {
  execute(input: SubmitReviewRequestDto): Promise<ReviewResponseDto>;
}