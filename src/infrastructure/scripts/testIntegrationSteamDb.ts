import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { SteamApiServiceImpl } from "../services/SteamApiServiceImpl";

async function runIntegrationTest() {
  console.log("=== 🔗 Steam API × DB 結合テスト開始 ===");

  // 1. インフラ層の準備（本物のアダプターたち）
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });
  const steamService = new SteamApiServiceImpl();

  // ⚠️ 先ほど成功したあなたのSteamIDと、DiscordIDを入れてください
  const mySteamId = "76561198390731925";
  const myDiscordId = "308100642423963648"; // 先ほどseedで使った自分のDiscordID

  try {
    // --------------------------------------------------
    // フェーズ1: Steamから現実のデータを取得する
    // --------------------------------------------------
    console.log(`\n📡 1. Steam APIからゲームデータを取得中...`);
    const steamGames = await steamService.getOwnedGames(mySteamId);
    console.log(`✅ ${steamGames.length} 件のゲームを取得しました。`);

    if (steamGames.length === 0) {
      console.log("取得件数が0のため、DBへの保存テストをスキップします。");
      return;
    }

    // --------------------------------------------------
    // フェーズ2: DBに保存する（ここが結合のキモ！）
    // --------------------------------------------------
    console.log(`\n💾 2. 取得したデータをデータベースに同期中...`);

    // ① まず、ユーザーがDBに存在するか確認（なければ作る）
    const user = await prisma.user.upsert({
      where: { discordId: myDiscordId },
      update: { steamId: mySteamId },
      create: { discordId: myDiscordId, steamId: mySteamId },
    });

    // ② 取得したSteamのゲームを、DBの構造に合わせて一気に保存（Upsert）する処理
    // ※今回はテストなので、最初の5件だけを同期してみます（全部やるとログが長くなるため）
    const targetGames = steamGames.slice(0, 5);

    for (const gameDto of targetGames) {
      // 1. Gameテーブルにゲーム情報を保存（すでに同じAppIDのゲームがあれば無視/更新）
      const gameRecord = await prisma.game.upsert({
        where: { steamAppId: gameDto.appId }, // schema.prismaで@uniqueにしている想定
        update: { title: gameDto.name, imageUrl: gameDto.imgIconUrl },
        create: { steamAppId: gameDto.appId, title: gameDto.name, imageUrl: gameDto.imgIconUrl },
      });

      // 2. PlayStatusテーブルで「このユーザーが、このゲームをどれくらい遊んだか」を紐付ける
      // ※複合キー(userId_gameId)でupsertする想定
      await prisma.playStatus.upsert({
        where: {
          userId_gameId: { userId: user.id, gameId: gameRecord.id },
        },
        update: { playtimeForever: gameDto.playtimeForever },
        create: { userId: user.id, gameId: gameRecord.id, playtimeForever: gameDto.playtimeForever },
      });

      console.log(`  -> 🎮 登録完了: ${gameDto.name} (プレイ時間: ${gameDto.playtimeForever}分)`);
    }

    console.log(`\n🎉 結合テスト完了！指定したゲームがDBに同期されました。`);
  } catch (error) {
    console.error("\n❌ エラーが発生しました:", error);
  } finally {
    // 使い終わったらDBとの接続を美しく閉じる
    await prisma.$disconnect();
  }
}

runIntegrationTest();
