import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Redis } from 'ioredis';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { LoginWithCodeDto } from './dto/login-with-code.dto';
import { AuthException, AuthErrorCode } from '../../common/exceptions/auth-exceptions';
import { EmailService } from '../notification/services/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    @Inject('REDIS_CLIENT')
    private readonly redisClient: Redis,
    private readonly emailService: EmailService,
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

  /**
   * 发送验证码
   */
  async sendVerificationCode(sendCodeDto: SendCodeDto) {
    const { email, type } = sendCodeDto;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('请输入有效的邮箱地址');
    }

    // 检查发送频率（60秒只能发送一次）
    const rateLimitKey = `verify_code_rate_limit:${email}`;
    const exists = await this.redisClient.exists(rateLimitKey);
    if (exists) {
      throw new BadRequestException('验证码发送过于频繁，请稍后再试');
    }

    // 如果是注册，检查邮箱是否已存在
    if (type === 'register') {
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new ConflictException('该邮箱已被注册');
      }
    }

    // 如果是登录，检查邮箱是否存在
    if (type === 'login') {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new BadRequestException('该账号不存在，请先注册');
      }
    }

    // 生成6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 存储验证码到Redis（5分钟有效期）
    const codeKey = `verify_code:${type}:${email}`;
    await this.redisClient.setex(codeKey, 300, code);

    // 设置发送频率限制（60秒）
    await this.redisClient.setex(rateLimitKey, 60, '1');

    // 发送邮件
    const subject = type === 'login' ? 'ProxyHub 登录验证码' : 'ProxyHub 注册验证码';
    const text = `您的验证码是：${code}，有效期5分钟，请勿泄露给他人。`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2C5F8D;">ProxyHub ${type === 'login' ? '登录' : '注册'}验证码</h2>
        <p>您好，</p>
        <p>您的验证码是：</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2C5F8D; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #666; margin-top: 20px;">
          • 验证码有效期为 <strong>5分钟</strong><br>
          • 请勿将验证码泄露给他人<br>
          • 如非本人操作，请忽略此邮件
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #999; font-size: 12px;">
          此邮件由 ProxyHub 系统自动发送，请勿回复。
        </p>
      </div>
    `;

    // 异步发送邮件（不等待结果，提高响应速度）
    this.emailService.sendEmail(email, subject, text, html).then((success) => {
      if (success) {
        this.logger.log(`✅ 验证码邮件已发送到: ${email}, 验证码: ${code}`);
      } else {
        this.logger.error(`❌ 验证码邮件发送失败: ${email}`);
      }
    }).catch((error) => {
      this.logger.error(`❌ 验证码邮件发送异常: ${email}`, error);
    });

    return {
      message: '验证码已发送，请查收邮箱',
      expiresIn: 300, // 5分钟
    };
  }

  /**
   * 验证码登录
   */
  async loginWithCode(loginWithCodeDto: LoginWithCodeDto) {
    const { email, code } = loginWithCodeDto;

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('请输入有效的邮箱地址');
    }

    // 验证验证码
    const codeKey = `verify_code:login:${email}`;
    const storedCode = await this.redisClient.get(codeKey);
    
    if (!storedCode) {
      throw new BadRequestException('验证码已过期或不存在，请重新获取');
    }

    if (storedCode !== code) {
      throw new BadRequestException('验证码错误，请重新输入');
    }

    // 查找用户
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('该账号不存在');
    }

    // 检查用户状态
    if (user.status === 'disabled') {
      throw new AuthException(
        AuthErrorCode.ACCOUNT_DISABLED,
        '账户已被禁用，请联系客服',
      );
    }

    // 验证成功后删除验证码
    await this.redisClient.del(codeKey);

    // 生成Token
    const tokens = await this.generateTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }
}

