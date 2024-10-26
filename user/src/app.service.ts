import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';

@Injectable()
export class AppService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
    });
    return newUser.save();
  }

  async getUser(email: string): Promise<User & { id: string }> {
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { ...user, id: user._id.toString() };
  }

  async updateBalance(email: string, balance: number) {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ email }, { balance }, { new: true })
      .lean();

    if (!updatedUser) {
      throw new Error('User not found or balance update failed');
    }

    return { ...updatedUser, id: updatedUser._id.toString() } as User;
  }
}
