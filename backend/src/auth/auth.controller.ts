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
   * Endpoint permettant aux membres de modifier leur mot de passe.
   */
  @Public()
  @Post('membre/change-password')
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(
      changePasswordDto.numeroCompte,
      changePasswordDto.newPassword,
    );
  }
}
