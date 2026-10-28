export interface IDeleteMessageUseCase {
  execute(chatId: string, messageId: string): Promise<void>;
}
