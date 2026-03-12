import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './decorators/public.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint pour la connexion administrative.
   * Public : accessible sans token.
   */
  @Public()
  @Post('admin/login')
  async loginAdmin(@Body() loginDto: LoginDto) {
    return this.authService.loginAdmin(loginDto);
  }

  /**
   * Endpoint pour la connexion des membres.
   * Supporte le login via email, numéro de compte ou téléphone.
   */
  @Public()
  @Post('membre/login')
  async loginMembre(@Body() loginDto: LoginDto) {
    return this.authService.loginMembre(loginDto);
  }

  /**
   * Endpoint pour le premier accès d'un membre.
   * Permet de configurer son mot de passe personnel.
   * Accessible sans token (le membre vient de recevoir son compte).
   * Protégé côté service : vérifie que firstAcces === true.
   */
  @Public()
  @Post('membre/first-access')
  async changePasswordFirstAccess(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePasswordFirstAccess(
      changePasswordDto.numeroCompte,
      changePasswordDto.newPassword,
    );
  }
}
