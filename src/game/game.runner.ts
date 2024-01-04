import { PlayerDto, RoomChats, RoomPlayers } from "@/games/entities/PlayerDto";
import {
  GameItemOne,
  Games,
  GameOne,
  GameOneDefault,
} from "@/games/entities/schema";
import { PlayerPlaceBidCB, PlayerWinCB } from "./game.types";

type oneBid = {
  roomId: string;
  playerId: string;
  itemId: number;
  amount: number;
};

type oneCumulItem = { itemId: number; cumul: number; bidCount: number };
type GameState = "running" | "brake";

export class GameRunner {
  bids: oneBid[] = [];
  roomId: string = "";
  itemsCumul: oneCumulItem[] = [];
  game: GameOne = { ...GameOneDefault };
  gameState: GameState = "brake";
  gameTimer: number = 0;
  players: PlayerDto[] = [];
  playerWin: PlayerWinCB;
  playerPlaceBid: PlayerPlaceBidCB;

  constructor({
    roomId,
    game,
    items,
    playerWin,
    playerPlaceBid,
  }: {
    roomId: string;
    game: GameOne;
    items: GameItemOne[];
    playerWin: PlayerWinCB;
    playerPlaceBid: PlayerPlaceBidCB;
  }) {
    this.playerWin = playerWin;
    this.playerPlaceBid = playerPlaceBid;
    this.roomId = roomId;
    this.game = game;
    this.itemsCumul = items.map((i) => ({
      itemId: i.id,
      cumul: 0,
      bidCount: 0,
    }));
    setInterval(this.gameRunner.bind(this), 1000);
  }
  addPlayer(player: PlayerDto) {
    let pindex = this.players.findIndex((p) => p.id == player.id);
    if (pindex < 0) {
      this.players.push(player);
    } else {
      this.players[pindex] = player;
    }
  }
  async placeBid(player: PlayerDto, item: number, amount: number) {
    if (!this.game.active && this.gameState != "running") {
      return false;
    }
    let newBalance = await this.playerPlaceBid(player, item, amount);
    if (newBalance) {
      player.balance = newBalance.newBalance;
      player.updateBalance(newBalance.newBalance);
      this.bids.push({
        itemId: item,
        playerId: player.id,
        roomId: this.roomId,
        amount: amount,
      });
      let itemCumul = this.itemsCumul.find((ic) => ic.itemId == item);
      if (itemCumul) {
        itemCumul.bidCount++;
        itemCumul.cumul += amount;
      }
      console.log(" placebid itemCumul", itemCumul);
      let pindex = this.players.findIndex((p) => p.id == player.id);
      if (pindex < 0) this.players.push(player);

      return true;
    } else {
      return false;
    }
  }
  gameRunner() {
    this.stateCheck();
    this.players.forEach((p) => {
      p.ws.send(
        JSON.stringify({
          type: "GameState",
          data: {
            gameState: this.gameState,
            items: this.itemsCumul,
            playerBids: this.bids
              .filter((b) => b.playerId == p.id)
              .map((b) => ({ itemId: b.itemId, amounth: b.amount })),
            balance: p.balance,
            name: p.name,
            remainingTime:
              ((this.gameState == "running"
                ? this.game.gameDuration
                : this.game.gameRest) ?? 60) - this.gameTimer,
          },
        })
      );
    });
  }
  finilizeGame() {
    this.gameState = "brake";
    let totalCash = this.bids.reduce((t, w) => {
      t += w.amount;
      return t;
    }, 0);
    let winner = this.itemsCumul.sort((a, b) => a.cumul - b.cumul)[0];
    if (winner.cumul) {
      let winperDolar = ((totalCash * 0.95) | 0) / winner.cumul;
      this.players.map(async (player) => {
        let totalWager = this.bids.reduce(
          (t, w) =>
            t +
            (w.playerId == player.id && winner.itemId == w.itemId
              ? w.amount
              : 0),
          0
        );
        let playerCash = (totalWager * winperDolar) | 0;
        let newBalance = await this.playerWin(player, playerCash);
        player.ws.send(
          JSON.stringify({
            type: "playerWin",
            data: {
              totalCash,
              playerCash,
              newBalance: newBalance ? newBalance.newBalance : 0,
            },
          })
        );
      });
    }
  }
  startGame() {
    this.bids = [];
    this.itemsCumul.map((ic) => {
      (ic.bidCount = 0), (ic.cumul = 0);
    });
    this.gameState = "running";
  }
  stateCheck() {
    this.gameTimer++;
    console.log("this.gameTimer", this.gameTimer);
    switch (this.gameState) {
      default:
      case "brake":
        if (this.gameTimer > (this.game.gameRest ?? 600)) {
          this.gameTimer = 0;
          this.startGame();
        }
        break;
      case "running":
        if (this.gameTimer > (this.game.gameDuration ?? 100)) {
          this.gameTimer = 0;
          this.finilizeGame();
        }
        break;
    }
  }
}
