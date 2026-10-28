export interface IResetPasswordUseCase {
  execute(
    token: string,
    newPassword: string,
    role: 'user' | 'driver' | 'admin'
  ): Promise<void>;
}
