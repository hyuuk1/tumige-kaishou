import { PrismaClient } from "@prisma/client";
import type { IGameRepository } from "../../application/interfaces/IGameRepository";
import type { SteamGameDto } from "../../application/interfaces/ISteamService";

export class GameRepositoryImpl implements IGameRepository {
  constructor(private prisma: PrismaClient) {}

  private readonly DB_QUERY_CHUNK_SIZE = 50;

  async syncUserGames(userId: number, games: SteamGameDto[]): Promise<void> {
    for (let i = 0; i < games.length; i += this.DB_QUERY_CHUNK_SIZE) {
      const chunks = games.slice(i, i + this.DB_QUERY_CHUNK_SIZE);

      const promises = chunks.map(async (gameDto) => {
        const gameRecord = await this.prisma.game.upsert({
          where: { steamAppId: gameDto.appId },
          update: { title: gameDto.name, imageUrl: gameDto.imgIconUrl ?? "" }, //画像null対策の??""
          create: { steamAppId: gameDto.appId, title: gameDto.name, imageUrl: gameDto.imgIconUrl ?? "" },
        });
        //gameのidが必要なので渋々2つに分けている
        await this.prisma.playStatus.upsert({
          where: {
            userId_gameId: { userId: userId, gameId: gameRecord.id },
          },
          update: { playtimeForever: gameDto.playtimeForever },
          create: { userId: userId, gameId: gameRecord.id, playtimeForever: gameDto.playtimeForever },
        });
      });
      await Promise.all(promises);
    }
  }
}
