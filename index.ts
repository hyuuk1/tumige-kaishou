import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { UserRepositoryImpl } from "./src/infrastructure/repositories/UserRepositoryImpl";
import { Client, GatewayIntentBits, Events } from "discord.js";
import { CompareTumigeController } from "./src/presentation/controllers/TumigeController";
import { CompareTumigeService } from "./src/application/service/CompareTumigeService";
import { GameRepositoryImpl } from "./src/infrastructure/repositories/GameRepositoryImpl";
import { SteamApiServiceImpl } from "./src/infrastructure/services/SteamApiServiceImpl";
import { SyncSteamService } from "./src/application/service/SyncSteamService";
import { SyncController } from "./src/presentation/controllers/SyncController";
import "dotenv/config";
import { DiscordServerRepositoryImpl } from "./src/infrastructure/repositories/DiscordServerRepositoryImpl";
import { RegisterUserService } from "./src/application/service/RegisterUserService";
import { RegisterUserController } from "./src/presentation/controllers/RegisterUserController";

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "BOTTOKEN";

async function bootstrap() {
  console.log("===  Discord Bot 起動準備中 ===");

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });

  const prismaClient = new PrismaClient({ adapter });

  const userRepository = new UserRepositoryImpl(prismaClient);
  const gameRepository = new GameRepositoryImpl(prismaClient);
  const discordServerRepository = new DiscordServerRepositoryImpl(prismaClient);

  //TODO:steamServiceとsyncSteamServiceの名前が似ててわかりづらいので変える
  const steamService = new SteamApiServiceImpl();

  const syncSteamService = new SyncSteamService(userRepository, steamService, gameRepository);
  const compareTumigeService = new CompareTumigeService(userRepository, discordServerRepository, steamService);
  const registerUserService = new RegisterUserService(userRepository);

  const syncController = new SyncController(syncSteamService);
  const tumigeController = new CompareTumigeController(compareTumigeService);
  const registerUserController = new RegisterUserController(registerUserService);

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers, // サーバーメンバーを取得するために必要
    ],
  });

  // Botの準備完了イベント
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Ready! ${readyClient.user.tag} としてログインしました！`);
  });

  // スラッシュコマンドを受け取るイベント
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "register") {
      await registerUserController.handle(interaction);
    }

    if (interaction.commandName === "sync") {
      await syncController.handle(interaction);
    }

    if (interaction.commandName === "tumige") {
      await tumigeController.handle(interaction);
    }
  });

  await client.login(DISCORD_BOT_TOKEN);
}

bootstrap();
