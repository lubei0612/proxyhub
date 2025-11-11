import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // ✅ No default value - application will fail to start if JWT_SECRET is not configured
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.authService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    if (user.status !== 'active') {
      throw new UnauthorizedException('账户已被禁用');
    }
    return user;
  }
}

