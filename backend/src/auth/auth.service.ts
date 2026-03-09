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
      throw new UnauthorizedException('Admin non trouvé ou inactif');
    }

    const isValid = await bcrypt.compare(password, admin.motDePasse);
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const payload = {
      id: admin.id,
      email: admin.email,
      numero_compte: admin.numeroCompte,
      role: 'admin',
    };

    this.logger.log(`[SUCCESS] Admin connecté : ${admin.nom} ${admin.prenom} (${admin.numeroCompte})`);
    return {
      success: true,
      message: 'Connexion réussie',
      token: this.jwtService.sign(payload),
      user: {
        ...payload,
        nom_complet: `${admin.prenom} ${admin.nom}`,
        photo_profil: admin.photoProfil,
      },
    };
  }

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
      throw new UnauthorizedException('Membre non trouvé');
    }

    if (!membre.motDePasse) {
      throw new UnauthorizedException('Compte membre non configuré');
    }

    const isValid = await bcrypt.compare(password, membre.motDePasse);
    if (!isValid) {
      throw new UnauthorizedException('Mot de passe incorrect');
    }

    const payload = {
      id: membre.id,
      email: membre.email,
      numero_compte: membre.numeroCompte,
      role: 'membre',
    };

    this.logger.log(`[SUCCESS] Membre connecté : ${membre.nomComplet} (${membre.numeroCompte})`);
    return {
      success: true,
      message: 'Connexion membre réussie',
      token: this.jwtService.sign(payload),
      user: {
        ...payload,
        nom_complet: membre.nomComplet,
        section: membre.typeCompte,
        firstAcces: (membre as any).firstAcces,
      },
    };
  }

  async changePassword(numeroCompte: string, newPassword: string) {
    const membre = await this.prisma.membre.findUnique({
      where: { numeroCompte },
    });

    if (!membre) {
      throw new BadRequestException('Membre non trouvé');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.membre.update({
      where: { id: membre.id },
      data: {
        motDePasse: hashedPassword,
        firstAcces: false,
      },
    });

    this.logger.log(`[PASSWORD_CHANGE] Mot de passe mis à jour pour : ${membre.numeroCompte}`);
    return {
      success: true,
      message: 'Mot de passe mis à jour avec succès',
    };
  }
}
