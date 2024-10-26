import { Body, Controller, Get, Inject, OnModuleInit, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { User } from './interfaces/user.interface';

@Controller()
export class AppController implements OnModuleInit {
  private usersService;
  private transactionsService;
  constructor(
    private readonly appService: AppService,
    @Inject('USERS_SERVICE') private userClient: ClientGrpc,
    @Inject('TRANSACTION_SERVICE') private transactionClient: ClientGrpc
  ) { }
  onModuleInit() {
    this.usersService = this.userClient.getService('UsersService')
    this.transactionsService = this.transactionClient.getService('TransactionService');
  }

  @Get('users/:email')
  async getUsers(@Param('email') email: string) {
    const userObservable = this.usersService.GetUser({ email });
    const user = await lastValueFrom(userObservable);
    return user;
  }

  @Post('users')
  async createUser(@Body() body: { name: string; email: string; password: string }) {
    const userObservable = this.usersService.CreateUser({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    const user = await lastValueFrom(userObservable);
    return user;
  }

  // @Post('transaction')
  // async createTransaction(@Body() body: { email: string; amount: number; type: 'debit' | 'credit' }) {
  //   // 1. دریافت اطلاعات کاربر
  //   const user = await lastValueFrom(this.usersService.GetUser({ email: body.email })) as User;

  //   if (!user) {
  //     throw new Error('User not found');
  //   }

  //   console.log("salamaaa",user)

  //   const newBalance = body.type === 'debit' ? user.balance - body.amount : user.balance + body.amount;

  //   if (newBalance < 0) {
  //     throw new Error('Insufficient balance');
  //   }

  //   await lastValueFrom(this.usersService.UpdateBalance({ email: body.email, balance: newBalance }));

  //   const transaction = await lastValueFrom(
  //     this.transactionsService.CreateTransaction({
  //       userId: user.id,
  //       amount: body.amount,
  //       type: body.type,
  //       date: new Date().toISOString(),
  //     })
  //   );

  //   return {
  //     message: 'Transaction successful',
  //     transaction,
  //     newBalance,
  //   };
  // }

  @Post('transaction')
  async createTransaction(@Body() body: { email: string; amount: number; type: 'debit' | 'credit' }) {
    const user = await lastValueFrom(this.usersService.GetUser({ email: body.email })) as User;

    if (!user || !user.id) {
      throw new Error('User not found or missing ID');
    }

    const newBalance = body.type === 'debit' ? user.balance - body.amount : user.balance + body.amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }
    console.log("1")
    await lastValueFrom(this.usersService.UpdateBalance({ email: body.email, balance: newBalance }));
    console.log("2")
    const transaction = await lastValueFrom(
      this.transactionsService.CreateTransaction({
        userId: user.id,
        amount: body.amount,
        type: body.type,
        date: new Date().toISOString(),
      })
    );

    return {
      message: 'Transaction successful',
      transaction,
      newBalance,
    };
  }

}

