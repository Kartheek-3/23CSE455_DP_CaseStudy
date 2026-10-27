/**
 * Vehicle Request DTOs
 */

export interface AddVehicleRequestDto {
  userId: string;
  vehicleImage: string;
  rcBookImage: string;
  Register_No: string;
  ownerName: string;
  vehicleName: string;
  vehicleType: string;
  polution_expire: string;
}

export interface UpdateVehicleRequestDto extends Partial<AddVehicleRequestDto> {}
