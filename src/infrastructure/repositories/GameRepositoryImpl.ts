import { PrismaClient } from "@prisma/client";
import type { IGameRepository } from "../../application/interfaces/IGameRepository";
import type { SteamGameDto } from "../../application/interfaces/ISteamService";

export class GameRepositoryImpl implements IGameRepository {
  constructor(private prisma: PrismaClient) {}

  async syncUserGames(userId: number, games: SteamGameDto[]): Promise<void> {
    for (const gameDto of games) {
      // 画像null対策の ?? ""
      const gameRecord = await this.prisma.game.upsert({
        where: { steamAppId: gameDto.appId },
        update: { title: gameDto.name, imageUrl: gameDto.imgIconUrl ?? "" },
        create: { steamAppId: gameDto.appId, title: gameDto.name, imageUrl: gameDto.imgIconUrl ?? "" },
      });

      //TODO:Promise.allで並列化したい
      await this.prisma.playStatus.upsert({
        where: {
          userId_gameId: { userId: userId, gameId: gameRecord.id },
        },
        update: { playtimeForever: gameDto.playtimeForever },
        create: { userId: userId, gameId: gameRecord.id, playtimeForever: gameDto.playtimeForever },
      });
    }
  }
}
