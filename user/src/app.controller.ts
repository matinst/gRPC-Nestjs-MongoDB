import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @GrpcMethod('UsersService', 'GetUser')
  async findOne(data: { email: string }) {
    const { email } = data;
    if (!email) throw new Error('Email is required');
    const user = await this.appService.getUser(email);
    return user;
  }

  @GrpcMethod('UsersService', 'CreateUser')
  async createUser(data: { name: string; email: string; password: string }) {
    const user = await this.appService.createUser(
      data.name,
      data.email,
      data.password,
    );
    return { user, name: user.name, email: user.email };
  }

  @GrpcMethod('UsersService', 'UpdateBalance')
  async updateBalance(data: { email: string; balance: number }) {
    const user = await this.appService.updateBalance(data.email, data.balance);
    return user;
  }
}
