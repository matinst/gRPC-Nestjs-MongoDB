import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './transaction.schema';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  async createTransaction(data: {
    userId: string;
    amount: number;
    type: string;
    date: string;
  }): Promise<Transaction> {
    const newTransaction = new this.transactionModel(data);
    return newTransaction.save();
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ userId }).exec();
  }
}
