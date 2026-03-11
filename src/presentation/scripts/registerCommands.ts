import "dotenv/config";
import { REST, Routes } from "discord.js";

const { DISCORD_BOT_TOKEN, APPLICATION_ID, GUILD_ID } = process.env;

// 環境変数の存在チェック（以前の型エラー対策）
if (!DISCORD_BOT_TOKEN || !APPLICATION_ID || !GUILD_ID) {
  console.error("❌ 環境変数が足りません。.env を確認してください。");
  process.exit(1);
}

// 登録するコマンドの定義
const commands = [
  {
    name: "tumige",
    description: "みんなの積みゲー状況を確認します",
  },
  {
    name: "sync",
    description: "Steamのライブラリを最新の状態に同期します",
  },
  {
    name: "register",
    description: "あなたのSteamIDを登録します",
    options: [
      {
        name: "steam_id",
        description: "SteamID64（17桁の数字）を入力してください",
        type: 3, // STRING型
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(DISCORD_BOT_TOKEN);

async function register() {
  try {
    console.log("📡 スラッシュコマンドを登録中...");

    // Guildコマンドとして登録（反映が早い）
    await rest.put(Routes.applicationGuildCommands(APPLICATION_ID!, GUILD_ID!), { body: commands });

    console.log("✅ コマンドの登録に成功しました！");
  } catch (error) {
    console.error("❌ 登録中にエラーが発生しました:", error);
  }
}

register();
