import axios from "axios";

// 手順1, 2で取得した値をここに入れてください
const STEAM_API_KEY = "D0C89D87B87BB8A691EAAC57CABE6FA4";
const TARGET_STEAM_ID: BigInt = 76561198390731925n;

// Steam APIのエンドポイント
// include_appinfo=true : ゲーム名などの詳細情報を取得するフラグ
// include_played_free_games=true : 無料ゲームも含める場合
// const ENDPOINT = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`;
const ENDPOINT = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/`;

interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // 総プレイ時間（分）
  img_icon_url?: string;
}

async function getBacklogGames() {
  try {
    console.log("Steam APIに問い合わせ中...");

    const axiosInstance = axios.create();
    const url = axiosInstance.getUri({
      url: ENDPOINT,
      params: {
        key: STEAM_API_KEY,
        steamid: TARGET_STEAM_ID,
        format: "json",
        include_appinfo: true,
      },
    });
    console.log(`Request URL: ${url}`);
    const response = await axios.get(ENDPOINT, {
      params: {
        key: STEAM_API_KEY,
        steamid: TARGET_STEAM_ID,
        format: "json",
        include_appinfo: true, // これがないとゲーム名が取れません
      },
    });

    const games: SteamGame[] = response.data.response.games;

    if (!games || games.length === 0) {
      console.log("ゲームが見つかりませんでした。（プロフィールの公開設定を確認してください）");
      return;
    }

    console.log(`総所持ゲーム数: ${response.data.response.game_count}本`);

    // 積みゲー判定ロジック：プレイ時間が0分のもの
    // ※少し起動しただけのものを入れたければ < 60 (1時間未満) などに調整
    const backlog = games.filter((game) => game.playtime_forever === 0);

    console.log(`\n=== あなたの積みゲーリスト (${backlog.length}本) ===`);

    // ランダムに5本だけ表示してみる
    backlog.slice(0, 5).forEach((game) => {
      console.log(`- [ID:${game.appid}] ${game.name}`);
    });

    if (backlog.length > 5) console.log("...他");
    console.log(games);
  } catch (error: any) {
    console.error("エラーが発生しました:");
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// getBacklogGames();
