import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } }) ?? null;
    }

    async findByUserName(UserName: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { UserName } }) ?? null;
    }

    async create(FirstName: string, LastName: string, UserName: string, email: string, password: string): Promise<User> {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ FirstName, LastName, UserName, email, password: hashedPassword });
        return this.usersRepository.save(user);
    }

    async save(user: User): Promise<User> {
        return this.usersRepository.save(user);
    }

    async generateResetToken(user: User): Promise<User> {
        const token = randomBytes(32).toString('hex');
        user.resetToken = token;
        user.resetTokenExpiration = new Date(Date.now() + 3600 * 1000);
        return this.usersRepository.save(user);
    }

    async findByResetToken(token: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { resetToken: token } });
    }

}
