import { UserRepositoryImpl } from "./UserRepositoryImpl";

async function runRepositoryTest() {
  console.log("=== 🗄️ UserRepositoryImpl 単体テスト開始 ===");

  // 1. Prisma Client の偽物（モック）を作成する
  // UserRepositoryImpl が内部で呼び出す `user.findUnique`, `user.findMany`, `user.update` だけを定義します。
  const mockPrismaClient: any = {
    user: {
      findUnique: async (args: any) => {
        console.log("[Mock DB] 🔍 findUnique が呼ばれました。条件:", args.where);
        // discordId が "wizard_123" ならユーザーを返す、それ以外は null (未登録)
        if (args.where.discordId === "wizard_123") {
          return { id: 1, discordId: "wizard_123", steamId: "steam_001" };
        }
        return null;
      },

      findMany: async (args: any) => {
        console.log("[Mock DB] 👥 findMany が呼ばれました。条件:", args.where);
        console.log("[Mock DB] 📦 include設定:", JSON.stringify(args.include, null, 2));

        // 要求されたDiscord IDの配列に応じて、適当なデータを返す
        return [
          {
            id: 1,
            discordId: "wizard_123",
            PlayStatuses: [{ gameId: 100, playtimeForever: 10, game: { id: 100, title: "テストゲーム" } }],
          },
        ];
      },

      update: async (args: any) => {
        console.log("[Mock DB] ✏️ update が呼ばれました。対象ID:", args.where.id);
        console.log("[Mock DB] 🔄 更新データ:", args.data);

        // 更新された風のデータを返す
        return {
          id: args.where.id,
          discordId: "wizard_123",
          steamId: args.data.steamId || "old_steam_id",
        };
      },
    },
  };

  // 2. 偽物の Prisma を注入してリポジトリをインスタンス化
  const userRepository = new UserRepositoryImpl(mockPrismaClient);

  try {
    // --- テストケース1: findByDiscordId ---
    console.log("\n--- 🧪 テスト1: 登録済みユーザーの検索 ---");
    const foundUser = await userRepository.findByDiscordId("wizard_123");
    console.log("結果:", foundUser ? "✅ 取得成功" : "❌ 取得失敗");

    console.log("\n--- 🧪 テスト2: 未登録ユーザーの検索 ---");
    const notFoundUser = await userRepository.findByDiscordId("unknown_999");
    console.log("結果:", notFoundUser === null ? "✅ nullが返った（正常）" : "❌ 異常なデータが返った");

    // --- テストケース3: findManyByDiscordIds ---
    console.log("\n--- 🧪 テスト3: 複数ユーザーと積みゲーの一括取得 ---");
    const manyUsers = await userRepository.findManyByDiscordIds(["wizard_123", "friend_456"]);
    console.log(`結果: ${manyUsers.length}件取得`);
    // gameがちゃんとincludeで取得できているか（型が通っているか）の確認
    console.log("ゲームタイトル:", manyUsers[0].PlayStatuses?.[0]?.game?.title);

    // --- テストケース4: update ---
    console.log("\n--- 🧪 テスト4: ユーザー情報の更新 ---");
    // IDやリレーションデータが混入しても、実装側（Rest parameters）で弾かれるかをテスト
    const updateResult = await userRepository.update(1, {
      id: 999, // 👈 これは弾かれるべき！
      steamId: "new_steam_id_777",
      PlayStatuses: [], // 👈 これも弾かれるべき！
    } as any);
    console.log("結果:", updateResult);
  } catch (error) {
    console.error("❌ エラー発生:", error);
  }
}

runRepositoryTest();
