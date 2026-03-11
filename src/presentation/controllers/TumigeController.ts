// src/presentation/controllers/CompareTumigeController.ts
import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags } from "discord.js";
import type { ICompareTumigeService } from "../../application/interfaces/ICompareTumigeService";

export class CompareTumigeController {
  constructor(private compareTumigeService: ICompareTumigeService) {}

  async handle(interaction: ChatInputCommandInteraction) {
    const commandUserId = interaction.user.id;
    const serverId = interaction.guildId;

    if (!serverId) {
      await interaction.reply({
        content: "サーバー内で実行してください。",
        flags: [MessageFlags.Ephemeral],
      });
      return;
    }

    const members = await interaction.guild!.members.fetch();
    const serverMemberIds = members.map((m) => m.id);

    // 一旦「考え中...」状態にする
    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

    try {
      const response = await this.compareTumigeService.execute(commandUserId, serverId, serverMemberIds);

      const displayDatas = response.tumigeDatas.slice(0, 10);

      const embeds: EmbedBuilder[] = [];

      for (const data of displayDatas) {
        const embed = new EmbedBuilder().setTitle(data.game.title).setColor("#0099ff");

        if (data.game.imageUrl) {
          embed.setThumbnail(data.game.imageUrl);
        }

        if (data.unplayedFriends.length === 0 && data.playedFriends.length === 0) {
          embed.setDescription("誰も持ってないぞ！お前がプレイして布教しろ！🔥");
        } else {
          // メンション文字列（<@ID>）に変換
          const unplayedMentions = data.unplayedFriends.map((f) => `<@${f.discordId}>`).join(" ");
          const playedMentions = data.playedFriends.map((f) => `<@${f.discordId}>`).join(" ");

          if (unplayedMentions) {
            embed.addFields({ name: "🤝 一緒に積んでる仲間", value: unplayedMentions });
          }
          if (playedMentions) {
            embed.addFields({ name: "👑 既プレイの先輩", value: playedMentions });
          }
        }
        embeds.push(embed);
      }

      // ウィザードの積みゲーがない場合のフォールバック
      if (embeds.length === 0) {
        await interaction.editReply("積みゲーは見つかりませんでした！素晴らしい！");
        return;
      }

      const totalCount = response.tumigeDatas.length;
      const footerText = totalCount > 10 ? `（全 ${totalCount} 件中、注目の 10 件を表示中）` : "";

      await interaction.editReply({
        content: `<@${response.wizard.discordId}> の積みゲー比較結果だ！ ${footerText}`,
        embeds,
      });
    } catch (error) {
      // カスタム例外などのエラーハンドリング
      console.error(error);
      await interaction.editReply("エラーが発生しました。登録がまだの場合は登録コマンドを実行してください。");
    }
  }
}
