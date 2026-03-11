import { CommandInteraction, MessageFlags } from "discord.js";
import { SyncSteamService } from "../../application/service/SyncSteamService";

export class SyncController {
  constructor(private syncSteamService: SyncSteamService) {}

  async handle(interaction: CommandInteraction) {
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const discordId = interaction.user.id;
      const count = await this.syncSteamService.execute(discordId);

      await interaction.editReply(`✅ 同期が完了しました！ ${count} 件のゲームを更新しました。`);
    } catch (error: any) {
      console.error(error);
      await interaction.editReply(`❌ エラーが発生しました: ${error.message}`);
    }
  }
}
