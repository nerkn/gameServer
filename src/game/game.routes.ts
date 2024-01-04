import { Elysia, t } from "elysia";
import { authentication } from "@/auth/auth.controller";
import { gamesState } from "@/games/game.service";
import { db } from "@/config/db";
import { PlayerDto, RoomChats, RoomPlayers } from "@/games/entities/PlayerDto";
import { GameRunner } from "./game.runner";
import { User } from "@/config/schema";

let Players: RoomPlayers = [{ roomId: "", players: [] }];
let ChatMessage: RoomChats = { "12": [{ id: 0, uId: "1", msg: "hello" }] };

export const game = new Elysia()
  .use(authentication)
  .use(gamesState)
  .use(db)
  .state<string, GameRunner[]>("runningGames", [])
  .derive(({ store, getAllRooms, getAllItems, placeBid, drizzle }) => {
    return {
      gameRoom: async (roomId: string) => {
        let runningGame = store.runningGames.find((r) => r.roomId == roomId);
        if (runningGame) {
          return runningGame;
        } else {
          console.log("gameroom cant find, creating a new:", roomId);
          let allRooms = await getAllRooms();
          let game = allRooms.find((gs) => "" + gs.id == roomId);
          if (game != null) {
            runningGame = new GameRunner({
              roomId,
              game,
              items: await getAllItems(roomId),
              playerPlaceBid: async (
                p: PlayerDto,
                item: number,
                amount: number
              ) =>
                amount > 0 ? await placeBid(p.id, roomId, item, amount) : false,
              playerWin: async (p: PlayerDto, amount: number) =>
                amount > 0 ? await placeBid(p.id, roomId, 0, -amount) : false,
            });
            store.runningGames.push(runningGame);
          } else {
            console.log(
              "allRooms",
              allRooms.map((r) => r.id + " " + r.name)
            );
            throw new Error("Where game? roomid:" + roomId);
          }
        }
        return runningGame;
      },
    };
  })

  .ws("/play", {
    gamesState,
    query: t.Object({
      roomid: t.String(),
    }),

    body: t.Object({
      type: t.String(),
      data: t.Any(),
    }),
    wsState: { user: undefined, room: null, game: undefined } as {
      user?: {
        name: string;
        id: string;
        balance: number;
        balanceCurrrency: string;
        ws: any;
      };
      game?: GameRunner;
    },
    async open(ws) {
      console.log("ws opening", ws.data.query.roomid);
      ws.data.getCurrentUser().then(async (cu) => {
        let roomId = ws.data.query.roomid;
        let game = await ws.data.gameRoom(ws.data.query.roomid);
        let RoomIndx = Players.findIndex((e) => e.roomId == roomId);
        if (RoomIndx < 0) {
          Players.push({ roomId: roomId, players: [] });
          RoomIndx = Players.length - 1;
        }
        let playerIndx = Players[RoomIndx].players.findIndex(
          (e) => e.id == cu.id
        );
        let user = {
          name: cu.name,
          id: cu.id,
          balance: cu.balance,
          balanceCurrrency: "$",
          updateBalance: (newBalance: number) =>
            Players.forEach((room) => {
              let userFound;
              if ((userFound = room.players.find((p) => p.id == cu.id)))
                userFound.balance = newBalance;
            }),
          ws,
        };
        let wsRaw = ws.raw as typeof ws.raw & { user: typeof user } & {
          game: typeof game;
        };
        wsRaw.user = user;
        wsRaw.game = game;
        game.addPlayer(user);
        if (playerIndx < 0) {
          Players[RoomIndx].players.push(user);
        } else {
          Players[RoomIndx].players[playerIndx] = user;
        }
        ws.send({ type: "allItems", data: await ws.data.getAllItems(roomId) });
      });
      if (!ws.data.getCurrentUser()) {
        ws.send({ name: "x", message: "NOT_AUTHENTICATED" });
      }

      console.log("ping send", await ws.data.getAllRooms());

      setInterval(() => {
        ws.send({
          type: "ping",
          data: {
            time: new Date().toISOString(),
            players: {
              players: Players.find(
                (e) => e.roomId == ws.data.query.roomid
              )?.players.map((p) => ({ id: p.id, name: p.name })),
              roomId: ws.data.query.roomid,
            },
            //  , gamesState.getAllRooms()
          },
        }); //, ws.data.getCurrentUser());
      }, 10000);

      ws.send({
        type: "chat",
        data: [{ uId: 0, msg: "chat'e hos geldiniz", name: "" }],
      });
    },
    async message(ws, message) {
      console.log("message arrived", message, ws.data.query);
      let wsRaw = ws.raw as typeof ws.raw & { user?: any };
      switch (message.type) {
        case "placeBid":
          let runningGame = await ws.data.gameRoom(ws.data.query.roomid);
          console.log("placeBid", message.data);
          if (wsRaw.user != undefined) {
            let res = await runningGame.placeBid(
              wsRaw.user,
              message.data.item,
              message.data.amount
            );
            ws.send({
              type: "info",
              data: { msg: res ? "success" : "problem" },
            });
          }
          break;
        case "chat":
          if (!(ws.data.query.roomid in ChatMessage))
            ChatMessage[ws.data.query.roomid] = [];
          let chatData = {
            id: 0,
            uId: "" + wsRaw.user?.id,
            msg: message.data,
            name: wsRaw.user?.name,
          };
          let newId = ChatMessage[ws.data.query.roomid].push(chatData);
          chatData.id = newId;
          Players.find(
            (e) => e.roomId == ws.data.query.roomid
          )?.players.forEach((p) => {
            p.ws.send({ type: "chat", data: [chatData] });
          });
      }

      console.log(Players.map((p) => p.players.map((pl) => pl.name)));
    },
  });
