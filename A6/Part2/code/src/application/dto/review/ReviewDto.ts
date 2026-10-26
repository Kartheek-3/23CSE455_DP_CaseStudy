/**
 * Review DTOs
 */

export interface SubmitReviewRequestDto {
  driverId: string;
  userId: string;
  rideId: string;
  rating: number;
  review?: string;
}

export interface ReviewResponseDto {
  success: boolean;
  message: string;
}
