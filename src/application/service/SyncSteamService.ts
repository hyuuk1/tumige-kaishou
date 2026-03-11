import type { IUserRepository } from "../interfaces/IUserRepository";
import type { ISteamService } from "../interfaces/ISteamService";
import type { IGameRepository } from "../interfaces/IGameRepository";

export class SyncSteamService {
  constructor(
    private userRepository: IUserRepository,
    private steamService: ISteamService,
    private gameRepository: IGameRepository,
  ) {}

  /**
   * ユーザーのSteamライブラリをDBと同期するユースケース
   * @param discordId コマンドを実行したユーザーのDiscord ID
   * @returns 同期したゲームの件数
   */
  async execute(discordId: string): Promise<number> {
    const user = await this.userRepository.findByDiscordId(discordId);
    if (!user || !user.steamId) {
      throw new Error("SteamIDが未登録です。先に `/register` コマンドでSteamIDを登録してください！");
    }

    const steamGames = await this.steamService.getOwnedGames(user.steamId);

    if (steamGames.length === 0) {
      return 0;
    }
    //TODO:steamがゲームを削除した場合も残り続ける可能性があるので修正
    await this.gameRepository.syncUserGames(user.id, steamGames);

    return steamGames.length;
  }
}
