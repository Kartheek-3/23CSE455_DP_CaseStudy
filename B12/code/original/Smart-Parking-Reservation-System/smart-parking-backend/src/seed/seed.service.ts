import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onApplicationBootstrap() {
    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@admin.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await this.userRepository.save(
        this.userRepository.create({
          email: 'admin@admin.com',
          password: hashedPassword,
          fullName: 'Built-in Admin',
          role: UserRole.ADMIN,
        }),
      );
    }
  }
}
