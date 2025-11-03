import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthException, AuthErrorCode } from '../../common/exceptions/auth-exceptions';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * 用户注册
   */
  async register(registerDto: RegisterDto) {
    const { email, password, nickname } = registerDto;

    // 检查邮箱是否已存在
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      nickname: nickname || email.split('@')[0],
      role: 'user',
      balance: 0,
      status: 'active',
    });

    await this.userRepository.save(user);

    // 生成Token
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new AuthException(
        AuthErrorCode.INVALID_EMAIL_FORMAT,
        '请输入有效的邮箱地址',
      );
    }

    // 查找用户
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new AuthException(
        AuthErrorCode.USER_NOT_FOUND,
        '该账号不存在，请先注册',
      );
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthException(
        AuthErrorCode.INVALID_PASSWORD,
        '密码错误，请重试',
      );
    }

    // 检查用户状态
    if (user.status !== 'active') {
      throw new AuthException(
        AuthErrorCode.ACCOUNT_DISABLED,
        '账户已被禁用，请联系客服',
      );
    }

    // 生成Token
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  /**
   * 管理员登录
   */
  async adminLogin(loginDto: LoginDto) {
    const result = await this.login(loginDto);

    // 验证管理员角色
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (user.role !== 'admin') {
      throw new AuthException(
        AuthErrorCode.ADMIN_REQUIRED,
        '需要管理员权限',
      );
    }

    return result;
  }

  /**
   * 刷新Token
   */
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('无效的Token');
      }

      return await this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Token已过期或无效');
    }
  }

  /**
   * 验证用户（用于策略）
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * 根据ID查找用户（用于JWT策略）
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  /**
   * 生成访问Token和刷新Token
   */
  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * 清理用户敏感信息
   */
  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}

