import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  async validate(payload: any) {
    // Ce qui est renvoyé ici sera attaché à request.user
    return {
      userId: payload.id,
      email: payload.email,
      numeroCompte: payload.numero_compte,
      role: payload.role,
      nomComplet: payload.nom_complet,
    };
  }
}
