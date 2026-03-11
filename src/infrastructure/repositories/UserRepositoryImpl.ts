import { PrismaClient } from "@prisma/client";
import type { IUserRepository } from "../../application/interfaces/IUserRepository"; // パスは適宜合わせてください
import type { User } from "../../domain/model/types";

export class UserRepositoryImpl implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByDiscordId(discordId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { discordId },
    });

    // Prismaの生成型とドメインの型を合わせるためのアサーション（必要に応じて）
    return user as User | null;
  }

  async findManyByDiscordIds(discordIds: string[]): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: {
        discordId: {
          in: discordIds,
        },
      },
      include: {
        PlayStatuses: {
          include: {
            game: true,
          },
        },
      },
    });

    return users as unknown as User[];
  }

  async update(userId: number, data: Partial<User>): Promise<User> {
    const { id, PlayStatuses, ...updateData } = data;

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return updatedUser as unknown as User;
  }

  async upsertByDiscordId(discordId: string, steamId: string): Promise<User> {
    return (await this.prisma.user.upsert({
      where: { discordId: discordId },
      update: { steamId: steamId },
      create: {
        discordId: discordId,
        steamId: steamId,
      },
    })) as User;
  }
}
