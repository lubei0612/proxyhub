import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * 查找用户（通过ID）
   */
  async findOne(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 查找用户（通过邮箱）
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  /**
   * 查找用户（通过API Key）
   */
  async findByApiKey(apiKey: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { apiKey } });
  }

  /**
   * 创建用户
   */
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  /**
   * 更新用户
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    const updatedUser = await this.findOne(id);
    if (!updatedUser) {
      throw new NotFoundException('用户不存在');
    }
    return updatedUser;
  }

  /**
   * 获取用户个人信息（不包含敏感信息）
   */
  async getProfile(userId: string) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 移除敏感信息
    const { password, ...profile } = user;
    return profile;
  }

  /**
   * 更新用户个人信息
   */
  async updateProfile(userId: string, data: { nickname?: string; email?: string }) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 如果更新邮箱，检查邮箱是否已被使用
    if (data.email && data.email !== user.email) {
      const existingUser = await this.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestException('该邮箱已被使用');
      }
      user.email = data.email;
    }

    if (data.nickname) {
      user.nickname = data.nickname;
    }

    const updatedUser = await this.userRepository.save(user);
    const { password, ...profile } = updatedUser;
    return profile;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证旧密码
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('原密码错误');
    }

    // 哈希新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    return { message: '密码修改成功' };
  }

  /**
   * 更新用户余额
   */
  async updateBalance(userId: string, amount: number, giftAmount = 0) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const currentBalance = parseFloat(user.balance as any) || 0;
    const currentGiftBalance = parseFloat(user.gift_balance as any) || 0;

    user.balance = (currentBalance + amount).toFixed(2) as any;
    user.gift_balance = (currentGiftBalance + giftAmount).toFixed(2) as any;

    return this.userRepository.save(user);
  }

  /**
   * 生成API Key
   */
  async generateApiKey(userId: string) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 生成唯一的API Key
    const apiKey = `pk_${Buffer.from(`${userId}-${Date.now()}`).toString('base64').substring(0, 32)}`;
    user.apiKey = apiKey;
    await this.userRepository.save(user);

    return { apiKey };
  }

  /**
   * 重置API Key
   */
  async resetApiKey(userId: string) {
    return this.generateApiKey(userId);
  }
}

