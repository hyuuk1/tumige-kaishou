//ドメインに制約をかけたくなったら、interface→classにしてコンストラクタを書こう
//PlayStatusはdb上に存在しない可能性があるためオプショナル
//PlayStatusの
export interface User {
  id: number;
  discordId: string;
  steamId: string | null;
  lastSyncedAt: Date | null;
  createdAt: Date;

  PlayStatuses?: PlayStatus[];
}

export interface DiscordServer {
  id: number;
  serverId: string;
  tumigeThresholdTime: number;
  lastBatchSyncedAt: Date | null;
  createdAt: Date;
}

export interface PlayStatus {
  id: number;
  userId: number;
  gameId: number;
  playtimeForever: number;
  updatedAt: Date;

  game?: Game;
}

export interface Game {
  id: number;
  steamAppId: number;
  title: string;
  imageUrl: string | null;
  createdAt: Date;

  PlayStatuses?: PlayStatus[];
}
