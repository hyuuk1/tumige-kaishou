import type { User, Game } from "../../domain/model/types";

export interface TumigeData {
  game: Game;
  unplayedFriends: User[];
  playedFriends: User[];
}

export interface CompareTumigeResponse {
  wizard: User; // コマンド実行者（ウィザード）
  tumigeDatas: TumigeData[];
}

export interface ICompareTumigeService {
  /**
   * 積みゲー比較実行
   * @param commandUserId コマンドを実行した人のDiscord ID
   * @param serverId 実行されたDiscordサーバーのID (閾値などを取得するため)
   * @param serverMemberIds 現在そのサーバーにいる全員のDiscord ID配列(都度discord apiに問い合わせるためユースケースは受け取るだけ)
   */
  execute(commandUserId: string, serverId: string, serverMemberIds: string[]): Promise<CompareTumigeResponse>;
}
