import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from './interfaces/user.interface';

@Controller('api')
export class AppController implements OnModuleInit {
  private usersService;
  private transactionsService;

  constructor(
    @Inject('USERS_SERVICE') private userClient: ClientGrpc,
    @Inject('TRANSACTION_SERVICE') private transactionClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.usersService = this.userClient.getService('UsersService');
    this.transactionsService = this.transactionClient.getService('TransactionService');
  }

  // Direct JSON API fallback for getting user details
  @Get('users/:email')
  async getUser(@Param('email') email: string) {
    const userObservable = this.usersService.GetUser({ email });
    const user = await lastValueFrom(userObservable);
    return { status: 'success', data: user };
  }

  @Post('users')
  async createUser(
    @Body() body: { name: string; email: string; password: string },
  ) {
    const userObservable = this.usersService.CreateUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    const user = await lastValueFrom(userObservable);
    return {status: 'success', data:user};
  }

  // Direct JSON API fallback for creating a transaction
  @Post('transaction')
  async createTransaction(
    @Body() body: { email: string; amount: number; type: 'debit' | 'credit' },
  ) {
    const user = await lastValueFrom(this.usersService.GetUser({ email: body.email })) as User;

    if (!user) {
      return { status: 'error', message: 'User not found' };
    }

    const newBalance = body.type === 'debit' ? user.balance - body.amount : user.balance + body.amount;
    if (newBalance < 0) {
      return { status: 'error', message: 'Insufficient balance' };
    }

    await lastValueFrom(this.usersService.UpdateBalance({ email: body.email, balance: newBalance }));
    const transaction = await lastValueFrom(this.transactionsService.CreateTransaction({
      userId: user.id,
      amount: body.amount,
      type: body.type,
      date: new Date().toISOString(),
    }));

    return { status: 'success', data: { transaction, newBalance } };
  }
}
