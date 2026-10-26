export interface IForgotPasswordUseCase {
  execute(email: string, role: "user" | "driver" | "admin"): Promise<void>;
}
