import type { IUserRepository } from "../interfaces/IUserRepository";

export class RegisterUserService {
  constructor(private userRepository: IUserRepository) {}

  async execute(discordId: string, steamId: string): Promise<void> {
    // 17桁の数字かどうかのバリデーション（簡易版）TODO:steamにちゃんと問い合わせる
    if (!/^\d{17}$/.test(steamId)) {
      throw new Error("SteamIDが正しくありません。17桁の数字（SteamID64）を入力してください。");
    }

    await this.userRepository.upsertByDiscordId(discordId, steamId);
  }
}
