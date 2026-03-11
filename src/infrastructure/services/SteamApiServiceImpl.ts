import type { ISteamService, SteamGameDto } from "../../application/interfaces/ISteamService";

export class SteamApiServiceImpl implements ISteamService {
  private readonly apiKey: string;
  private readonly baseUrl = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/";

  constructor() {
    const key = process.env.STEAM_API_KEY;
    if (!key) {
      throw new Error("環境変数 STEAM_API_KEY が設定されていません。");
    }
    this.apiKey = key;
  }

  async getOwnedGames(steamId: string): Promise<SteamGameDto[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.append("key", this.apiKey);
    url.searchParams.append("steamid", steamId);
    url.searchParams.append("include_appinfo", "true"); // ゲームのタイトルや画像URLも含める
    url.searchParams.append("include_played_free_games", "true"); // 無料ゲームも含めるかTODO:カスタム可能にする予定
    url.searchParams.append("format", "json");

    try {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Steam API エラー: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // プロフィールが非公開の場合などは games 配列が存在しないことがある
      if (!data.response || !data.response.games) {
        return [];
      }

      return data.response.games.map(
        (game: any): SteamGameDto => ({
          appId: game.appid,
          name: game.name,
          playtimeForever: game.playtime_forever,
          // 画像URLはハッシュ値で返ってくるため、Steamの画像サーバーのURLに組み立てる
          imgIconUrl: game.img_icon_url
            ? `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
            : null,
        }),
      );
    } catch (error) {
      console.error("[SteamApiServiceImpl] 通信エラー:", error);
      throw error;
    }
  }
}
