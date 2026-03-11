import { ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { RegisterUserService } from "../../application/service/RegisterUserService";

export class RegisterUserController {
  constructor(private registerUserService: RegisterUserService) {}

  async handle(interaction: ChatInputCommandInteraction) {
    const steamId = interaction.options.getString("steam_id", true);
    const discordId = interaction.user.id;

    try {
      await this.registerUserService.execute(discordId, steamId);
      await interaction.reply({
        content: `✅ SteamIDを登録しました！ \`/sync\` を実行してゲーム情報を読み込んでください。`,
        flags: [MessageFlags.Ephemeral],
      });
    } catch (error: any) {
      await interaction.reply({
        content: `❌ エラー: ${error.message}`,
        flags: [MessageFlags.Ephemeral],
      });
    }
  }
}
