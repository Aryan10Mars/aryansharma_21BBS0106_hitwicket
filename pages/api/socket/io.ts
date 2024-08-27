import { Server as NetServer } from "http";
import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { NextApiResponseServerIo } from "@/types/types";
import { Game } from "@/lib/game";

export const config = {
    api: {
        bodyParser: false,
    },
};

const games = new Map<string, Game>();

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
    if (!res.socket.server.io) {
        const path = "/api/socket/io";
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });

        io.on('connection', (socket) => {
            console.log('New client connected', socket);

            socket.on('createGame', () => {
                const gameId = Math.random().toString(36).substring(7);
                const game = new Game();
                games.set(gameId, game);
                socket.join(gameId);
                socket.emit('gameCreated', gameId);
                // Send initial game state
                io.to(gameId).emit('gameState', game.getState());
            });

            socket.on('joinGame', (gameId: string) => {
                const game = games.get(gameId);
                if (game && game.players.length < 2) {
                    socket.join(gameId);
                    game.addPlayer(socket.id);
                    io.to(gameId).emit('gameState', game.getState());
                } else {
                    socket.emit('error', 'Game not found or full');
                }
            });

            socket.on('move', ({ gameId, move }: { gameId: string; move: any }) => {
                const game = games.get(gameId);
                if (game) {
                    try {
                        game.makeMove(socket.id, move);
                        io.to(gameId).emit('gameState', game.getState());
                        
                        // if (game.isGameOver()) {
                        //     io.to(gameId).emit('gameOver', { winner: game.getWinner() });
                        //     games.delete(gameId);
                        // }
                    } catch (error) {
                        socket.emit('error', (error as Error).message);
                    }
                } else {
                    socket.emit('error', 'Game not found');
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
                // Handle player disconnection (e.g., end the game if a player leaves)
                // for (const [gameId, game] of games.entries()) {
                //     if (game.players.includes(socket.id)) {
                //         io.to(gameId).emit('playerDisconnected', socket.id);
                //         games.delete(gameId);
                //         break;
                //     }
                // }
            });
        });

        res.socket.server.io = io;
    }

    res.end();
};

export default ioHandler;