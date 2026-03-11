import type { User, Game } from "../../domain/model/types";
import type { ICompareTumigeService, CompareTumigeResponse } from "../interfaces/ICompareTumigeService";
import type { IUserRepository } from "../interfaces/IUserRepository";
import type { ISteamService } from "../interfaces/ISteamService";
import type { IDiscordServerRepository } from "../interfaces/IDiscordServerRepository";

export class CompareTumigeService implements ICompareTumigeService {
  constructor(
    private userRepository: IUserRepository,
    private discordServerRepository: IDiscordServerRepository,
    private steamService: ISteamService,
  ) {}

  async execute(commandUserId: string, serverId: string, serverMemberIds: string[]): Promise<CompareTumigeResponse> {
    //TODO:マジックナンバー修正
    //サーバー設定取得
    const serverConfig = await this.discordServerRepository.findByServerId(serverId);
    const threshold = serverConfig?.tumigeThresholdTime ?? 180;

    const allMembers = await this.userRepository.findManyByDiscordIds(serverMemberIds);

    const wizard = allMembers.find((m) => m.discordId === commandUserId);

    //TODO:ユーザー登録ができていないというカスタム例外を作りスロー
    if (!wizard) {
      throw new Error("ユーザーが登録されていません。先に登録コマンドを実行してください。");
    }

    // -------------------------------------------------------------
    // [TODO] ここに「Steam APIを使ったデータの最新化(同期)処理」が入る想定
    // ※今回は比較ロジックに集中するため、DBのデータが最新である前提で進めます
    // -------------------------------------------------------------

    //ウィザードの積みゲーを抽出
    //インターフェースでPlayStatusesの型がオプショナルであることに注意。
    //TODO:ウィザードのプレイ状況が空だった場合のカスタム例外を作りスロー
    const wizardPlayStatuses = wizard.PlayStatuses || [];
    const wizardTumigeStatuses = wizardPlayStatuses.filter(
      (status) => status.playtimeForever <= threshold && status.game,
    );

    //他のユーザーと比較して結果を生成
    const tumigeDatasResult: CompareTumigeResponse["tumigeDatas"] = [];

    for (const tumigeStatus of wizardTumigeStatuses) {
      const game = tumigeStatus.game!;
      const unplayedFriends: User[] = [];
      const playedFriends: User[] = [];

      // 他のメンバー全員と比較
      for (const member of allMembers) {
        if (member.discordId === wizard.discordId) {
          continue;
        }

        const memberStatuses = member.PlayStatuses || [];
        const memberGameStatus = memberStatuses.find((s) => s.gameId === game.id);

        if (memberGameStatus) {
          if (memberGameStatus.playtimeForever <= threshold) {
            unplayedFriends.push(member);
          } else {
            playedFriends.push(member);
          }
        }
      }

      tumigeDatasResult.push({
        game,
        unplayedFriends,
        playedFriends,
      });
    }

    return {
      wizard,
      tumigeDatas: tumigeDatasResult,
    };
  }
}
