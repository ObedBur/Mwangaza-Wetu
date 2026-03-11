import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
    });
  }

  /**
   * Valide le payload du JWT et effectue une vérification active en base de données.
   * Retourne les informations de l'utilisateur qui seront injectées dans l'objet Request.
   */
  async validate(payload: any) {
    if (!payload.id || !payload.role) {
      throw new UnauthorizedException('Token invalide');
    }

    // Validation active : vérification de l'état de l'utilisateur en base de données
    if (payload.role === 'admin') {
      const admin = await this.prisma.administrateur.findUnique({
        where: { id: payload.id },
      });
      if (!admin || !admin.actif) {
        throw new UnauthorizedException('Accès administrateur révoqué ou inactif');
      }
      return { id: admin.id, email: admin.email, role: 'admin' };
    } else {
      const membre = await this.prisma.membre.findUnique({
        where: { id: payload.id },
      });
      if (!membre || membre.statut !== 'actif') {
        throw new UnauthorizedException('Compte membre désactivé ou inexistant');
      }
      return { id: membre.id, email: membre.email, numeroCompte: membre.numeroCompte, role: 'membre' };
    }
  }
}
