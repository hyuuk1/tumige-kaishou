import { PrismaClient } from "@prisma/client";
import { IDiscordServerRepository, DiscordServer } from "../../application/interfaces/IDiscordServerRepository";

export class DiscordServerRepositoryImpl implements IDiscordServerRepository {
  constructor(private prisma: PrismaClient) {}

  async findByServerId(serverId: string): Promise<DiscordServer> {
    return await this.prisma.discordServer.upsert({
      where: { serverId: serverId },
      update: {},
      create: {
        serverId: serverId,
        tumigeThresholdTime: 180, // デフォルト3時間:TODO:マジックナンバー修正
      },
    });
  }
}
