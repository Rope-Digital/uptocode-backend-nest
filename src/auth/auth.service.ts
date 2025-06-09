import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(identifier: string, password: string): Promise<any> {
        const user =
            (await this.usersService.findByEmail(identifier)) ||
            (await this.usersService.findByUserName(identifier));
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            UserName: user.UserName,
        };

        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(FirstName: string, LastName: string, UserName: string, email: string, password: string) {
        const existing = await this.usersService.findByEmail(email);
        if (existing) throw new UnauthorizedException('Email already in use');
        return this.usersService.create(FirstName, LastName, UserName, email, password);
    }

    async sendResetEmail(email: string, token: string) {
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: '"Uptocode" <no-reply@uptocode.com>',
            to: email,
            subject: 'Reset your password',
            html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
        });
    }

    async forgotPassword(identifier: string) {
        const user =
            (await this.usersService.findByEmail(identifier)) ||
            (await this.usersService.findByUserName(identifier));

        if (!user) throw new NotFoundException('User not found');

        const updatedUser = await this.usersService.generateResetToken(user);
        await this.sendResetEmail(updatedUser.email, updatedUser.resetToken);

        return { message: 'Reset password email sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.usersService.findByResetToken(token);

        if (!user || !user.resetTokenExpiration || user.resetTokenExpiration < new Date()) {
            throw new BadRequestException('Invalid or expired token');
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = '';
        user.resetTokenExpiration = null;

        return this.usersService.save(user);
    }

}