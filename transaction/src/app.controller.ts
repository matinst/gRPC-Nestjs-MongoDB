import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appSerivce: AppService) {}

  @GrpcMethod('TransactionService', 'CreateTransaction')
  async createTransaction(data: { userId: string; amount: number; type: string; date: string }) {
    const transaction = await this.appSerivce.createTransaction({
      userId: data.userId,
      amount: data.amount,
      type: data.type,
      date: data.date,
    });

    return {
      transactionId: transaction._id.toString(),
      userId: transaction.userId,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      status: 'success',
    };
  }

  @GrpcMethod('TransactionService', 'GetTransactionsByUser')
  async getTransactionsByUser(data: { userId: string }) {
    const transactions = await this.appSerivce.getTransactionsByUser(data.userId);

    return {
      transactions: transactions.map((transaction) => ({
        transactionId: transaction._id.toString(),
        userId: transaction.userId,
        amount: transaction.amount,
        type: transaction.type,
        date: transaction.date,
      })),
    };
  }
}
