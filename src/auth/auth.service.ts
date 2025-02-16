import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) { }

    async signup(dto: AuthDto) {
        // Get the password hash
        const hash = await argon.hash(dto.password);

        // Save the user in the database
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash, // Save the hashed password
                },
            });
            return this.signToken(user.id, user.email);
        } catch (error) {
            // Handle known Prisma errors
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('User already exists');
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        // Find user by email
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email,
            },
        });

        // Check if user does not exist and throw error
        if (!user) {
            throw new ForbiddenException('Credentials incorrect');
        }

        // Check if password is correct
        const pwPass = await argon.verify(user.hash, dto.password);

        if (!pwPass) {
            throw new ForbiddenException('Credentials incorrect');
        }
        // Return user or token as per your requirement
        return this.signToken(user.id, user.email); // or return a token if implementing authentication
    }

    // to make a session token
    async signToken(
        userId: number,
        email: string,
      ): Promise<{ access_token: string }> {
        const payload = {
          sub: userId,
          email,
        };
        const secret = this.config.get('JWT_SECRET');
    
        const token = await this.jwt.signAsync(
          payload,
          {
            expiresIn: '15m',
            secret: secret,
          },
        );
    
        return {
          access_token: token,
        };
      }
}
