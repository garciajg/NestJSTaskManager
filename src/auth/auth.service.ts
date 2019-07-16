import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt.payload.interface';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) {

    }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        return this.userRepository.signUp(authCredentialsDto);
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const user = await this.userRepository.validateUserPassword(authCredentialsDto);

        if (!user) {
            throw new UnauthorizedException('Invalid Credentials')
        }

        const payload: JwtPayload = { user };
        const accessToken = await this.jwtService.sign(payload);
        user.access_token = accessToken;

        return user;
    }
}
