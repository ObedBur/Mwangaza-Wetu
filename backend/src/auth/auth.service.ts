import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { Administrateur, Membre } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Authentifie un administrateur par email ou numéro de compte.
   * Vérifie également si le compte est actif avant de générer le token.
   */
  async loginAdmin(loginDto: LoginDto) {
    const { email, numeroCompte, password } = loginDto;
    let admin: Administrateur | null = null;

    if (email) {
      admin = await this.prisma.administrateur.findUnique({ where: { email } });
    } else if (numeroCompte) {
      admin = await this.prisma.administrateur.findUnique({
        where: { numeroCompte },
      });
    } else {
      throw new BadRequestException('Email ou numéro de compte requis');
    }

    if (!admin || !admin.actif) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isValid = await bcrypt.compare(password, admin.motDePasse);
    if (!isValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      numero_compte: admin.numeroCompte,
      role: admin.role,
    };

    this.logger.log(`[SUCCESS] Admin connecté : ${admin.numeroCompte}`);
    return {
      success: true,
      message: 'Connexion réussie',
      token: this.jwtService.sign(payload, { expiresIn: '8h' }),
      user: {
        ...payload,
        nom_complet: `${admin.prenom} ${admin.nom}`,
        photo_profil: admin.photoProfil,
      },
    };
  }

  /**
   * Authentifie un membre par email, numéro de compte ou téléphone.
   * Vérifie l'existence du mot de passe et l'état du compte.
   */
  async loginMembre(loginDto: LoginDto) {
    const { email, numeroCompte, telephone, password } = loginDto;
    let membre: Membre | null = null;

    if (email) {
      membre = await this.prisma.membre.findFirst({ where: { email } });
    } else if (numeroCompte) {
      membre = await this.prisma.membre.findUnique({ where: { numeroCompte } });
    } else if (telephone) {
      membre = await this.prisma.membre.findFirst({ where: { telephone } });
    } else {
      throw new BadRequestException('Email, numéro de compte ou téléphone requis');
    }

    if (!membre) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (!membre.motDePasse) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isValid = await bcrypt.compare(password, membre.motDePasse);
    if (!isValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const payload = {
      id: membre.id,
      email: membre.email,
      numero_compte: membre.numeroCompte,
      role: 'membre',
    };

    this.logger.log(`[SUCCESS] Membre connecté : ${membre.numeroCompte}`);
    return {
      success: true,
      message: 'Connexion membre réussie',
      token: this.jwtService.sign(payload, { expiresIn: '24h' }),
      user: {
        ...payload,
        nom_complet: membre.nomComplet,
        section: membre.typeCompte,
        firstAcces: membre.firstAcces,
      },
    };
  }

  /**
   * Permet à un membre de configurer son mot de passe lors du premier accès.
   * Accessible uniquement quand firstAcces est true.
   * Met à jour le flag firstAcces à false après le changement.
   */
  async changePasswordFirstAccess(numeroCompte: string, newPassword: string) {
    const membre = await this.prisma.membre.findUnique({
      where: { numeroCompte },
    });

    if (!membre) {
      throw new BadRequestException('Membre non trouvé');
    }

    if (!membre.firstAcces) {
      throw new BadRequestException(
        'Ce compte a déjà été configuré. Contactez un administrateur pour réinitialiser votre mot de passe.',
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.membre.update({
      where: { id: membre.id },
      data: {
        motDePasse: hashedPassword,
        firstAcces: false,
      },
    });

    this.logger.log(`[FIRST_ACCESS] Mot de passe configuré pour : ${membre.numeroCompte}`);
    return {
      success: true,
      message: 'Mot de passe configuré avec succès',
    };
  }
}
