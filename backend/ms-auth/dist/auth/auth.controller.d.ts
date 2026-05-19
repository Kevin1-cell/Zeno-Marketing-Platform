import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    health(): {
        status: string;
    };
    login(loginDto: LoginDto): Promise<AuthResponseDto>;
    refresh(refreshToken: string): Promise<AuthResponseDto>;
    logout(req: any): Promise<{
        message: string;
    }>;
}
