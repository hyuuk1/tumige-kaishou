import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// アダプターを注入！
const prisma = new PrismaClient({ adapter });

async function main() {
  const myDiscordId = "308100642423963648"; // 👈 ここをあなたのIDに！

  console.log("🌱 データベースにテストデータを投入します...");

  // 1. ゲームを登録
  const gameA = await prisma.game.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, steamAppId: 10, title: "大人気ゲーム", imageUrl: "https://example.com/a.jpg" },
  });

  const gameB = await prisma.game.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, steamAppId: 20, title: "誰も持ってないマイナー神ゲー", imageUrl: "https://example.com/b.jpg" },
  });

  // 2. あなた（ウィザード）を登録し、積みゲーを紐付ける
  const me = await prisma.user.upsert({
    where: { discordId: myDiscordId },
    update: {},
    create: {
      discordId: myDiscordId,
      steamId: "my_steam_id",
      PlayStatuses: {
        create: [
          { gameId: gameA.id, playtimeForever: 10 }, // 積んでる（10分）
          { gameId: gameB.id, playtimeForever: 0 }, // 積んでる（0分）
        ],
      },
    },
  });

  console.log(`✅ テストデータの投入が完了しました！ (User ID: ${me.discordId})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
