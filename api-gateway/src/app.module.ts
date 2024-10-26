import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'users',
          protoPath: join(__dirname, 'protos/users.proto'),
          url: 'localhost:50051',
        },
      },
      {
        name: 'TRANSACTION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'transactions',
          protoPath: join(__dirname, 'protos/transactions.proto'),
          url: 'localhost:50052',
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
