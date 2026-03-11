import type { SteamGameDto } from "./ISteamService";

export interface IGameRepository {
  /**
   * ユーザーのゲームリスト（Steamから取得したデータ）をDBに同期する
   */
  syncUserGames(userId: number, games: SteamGameDto[]): Promise<void>;
}
