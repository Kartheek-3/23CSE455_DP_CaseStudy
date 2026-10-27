

export interface WalletTransaction {
    transactionId: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    description: string;
    createdAt: Date;
  }
  
  export interface Wallet {
   _id?: string; // Optional field for the wallet ID
    userId: string;
    balance: number;
    transactions: WalletTransaction[];
    createdAt: Date;
    updatedAt: Date;
  }
  