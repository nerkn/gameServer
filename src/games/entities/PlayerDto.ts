export type PlayerDto = {
  name: string;
  id: string;
  balance: number;
  balanceCurrrency: string;
  updateBalance: (newBalance: number) => void;
  ws: any;
};

export type PlayerInfo = {
  id: string;
  name: string;
};
export type RoomPlayers = [
  {
    roomId: string;
    players: PlayerDto[];
  }
];
export type RoomChats = {
  [roomId: string]: { id: number; uId: string; msg: string }[];
};
