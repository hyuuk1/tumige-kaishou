export interface SteamGameDto {
  appId: number;
  name: string;
  playtimeForever: number;
  imgIconUrl: string | null;
}

export interface ISteamService {
  getOwnedGames(steamId: string): Promise<SteamGameDto[]>;
}
