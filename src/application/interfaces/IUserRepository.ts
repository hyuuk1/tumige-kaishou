import { User } from "../../domain/model/types";

export interface IUserRepository {
  findByDiscordId(discordId: string): Promise<User | null>;

  /**

サーバーにいるユーザー達を一括で取得する (PlayStatus付きで)

* @note

* Prismaの仕様上、リレーション（PlayStatuses）のデータが存在しない場合は空配列 `[]` が返りますが、

* dbの仕様に依存するため、このインターフェースでは"データが返ってくることを保証しません"

* そのため、呼び出し元（ユースケース側）では念のため `const statuses = user.PlayStatuses || []` のように

* フォールバック（例外処理）を行ってから利用してください。

*/

  findManyByDiscordIds(discordIds: string[]): Promise<User[]>;

  update(userId: number, data: Partial<User>): Promise<User>;

  upsertByDiscordId(discordId: string, steamId: string): Promise<User>;
}
