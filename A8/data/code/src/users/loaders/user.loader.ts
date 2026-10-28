import { Injectable, Scope } from '@nestjs/common';
// import * as DataLoader from 'dataloader';
import DataLoader from 'dataloader';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable({ scope: Scope.REQUEST })
export class UserDataLoader {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  public readonly userLoader = new DataLoader<string, User | undefined>(
    async (userIds: string[]) => {
      const users = await this.userRepo.find({
        where: { id: In(userIds) },
      });
      const mappedUser = new Map(users.map((u) => [u.id, u])); // {"u1"=> {id: "u1", name: "zeyad"}}
      return userIds.map((id) => mappedUser.get(id));
    },
  );
}
