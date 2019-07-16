import { Repository, EntityRepository } from "typeorm";
import { User } from "./user.entity";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';


@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { username, password } = authCredentialsDto;
        let salt = await bcrypt.genSalt();

        const user = new User()
        user.username = username;
        user.salt = salt;
        user.password = await this.hashPassword(password, salt);

        try {
            await user.save()
        } catch (err) {
            console.log(err)
            if (err.code === '23505') { // duplicate username
                throw new ConflictException('Username already exists')
            } else {
                throw new InternalServerErrorException(err)
            }
        }

        return user;
    }

    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<User> {
        const { username, password } = authCredentialsDto;
        const user = await this.findOne({ username });

        if (user.validatePassword(password)) {
            return user;
        } else {
            return null;
        }
    }

    private async hashPassword(password: string, salt: string): Promise<string> {
        return await bcrypt.hash(password, salt);
    }
}