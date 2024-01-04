import { PlayerDto } from "@/games/entities/PlayerDto";

export type PlayerPlaceBidCB = (
  p: PlayerDto,
  item: number,
  amount: number
) => Promise<false | { newBalance: number }>;
export type PlayerWinCB = (
  p: PlayerDto,
  amount: number
) => Promise<false | { newBalance: number }>;
