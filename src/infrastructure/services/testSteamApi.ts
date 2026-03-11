import "dotenv/config";
import { SteamApiServiceImpl } from "./SteamApiServiceImpl";

async function runSteamApiTest() {
  console.log("=== 🎮 Steam API 通信単体テスト開始 ===");

  if (!process.env.STEAM_API_KEY) {
    console.error("❌ STEAM_API_KEY が設定されていません！.env を確認してください。");
    return;
  }

  const steamService = new SteamApiServiceImpl();

  // ⚠️ ここにあなた自身の SteamID64（17桁の数字）を入力してください！
  // 例: "76561198000000000"
  const mySteamId = "76561198390731925";

  console.log(`📡 Steam ID: ${mySteamId} のゲームデータを取得中...`);

  try {
    const games = await steamService.getOwnedGames(mySteamId);

    console.log(`\n✅ 取得成功！ 合計 ${games.length} 本のゲームが見つかりました。`);

    if (games.length > 0) {
      console.log("\n--- 最初の3件のデータ構造を確認 ---");
      // 先頭3件だけを綺麗に出力
      console.dir(games.slice(0, 3), { depth: null, colors: true });

      // おまけ：一番プレイ時間が長いゲームを算出してみる
      const mostPlayed = [...games].sort((a, b) => b.playtimeForever - a.playtimeForever)[0];
      console.log(
        `\n👑 一番遊んでいるゲーム: ${mostPlayed.name} (約 ${Math.floor(mostPlayed.playtimeForever / 60)} 時間)`,
      );
    } else {
      console.log("\n⚠️ ゲームが0件でした。");
      console.log(
        "原因候補: Steamプロフィールの「ゲームの詳細」が『非公開』または『フレンドのみ』になっている可能性があります。",
      );
    }
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
  }
}

runSteamApiTest();
