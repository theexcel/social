import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createUser(
    username: string,
    email: string,
    password: string,
  ): Promise<User> {
    if (!username || !email || !password) {
      throw new BadRequestException('Missing required fields');
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if(existingUser){
      throw new ConflictException('Username or email already exists')
    }
    const user = this.userRepository.create({ username, email, password });
    await user.hashPassword();
    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User> {
    const user = this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
