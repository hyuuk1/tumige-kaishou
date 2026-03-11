export interface DiscordServer {
  id: number;
  serverId: string;
  tumigeThresholdTime: number;
}

export interface IDiscordServerRepository {
  findByServerId(serverId: string): Promise<DiscordServer>;
}
