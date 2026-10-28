export interface IChangePasswordUseCase {
  execute(
    userId: string,
    oldPassword: string,
    newPassword: string,
    role: "user" | "driver" | "admin"
  ): Promise<void>;
}
