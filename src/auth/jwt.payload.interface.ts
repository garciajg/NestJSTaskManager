import { User } from "./user.entity";

export interface JwtPayload {
    user: User;
}