import { Server as ServerIO } from "socket.io"
import { Game } from "./game"

export class GameHandler {
    private io: ServerIO;
    private games: Map<string, Game> = new Map();

    constructor(io: ServerIO) {
        this.io = io;
    }

    initialize() {
        this.io.on('connection', (socket) => {
            console.log('New client connected');

            socket.on('createGame', () => {
                const gameId = Math.random().toString(36).substring(7);
                this.games.set(gameId, new Game());
                socket.join(gameId);
                socket.emit('gameCreated', gameId);
            });

            socket.on('joinGame', (gameId: string) => {
                const game = this.games.get(gameId);
                if (game && game.players.length < 2) {
                    socket.join(gameId);
                    game.addPlayer(socket.id);
                    this.io.to(gameId).emit('gameState', game.getState());
                } else {
                    socket.emit('error', 'Game not found or full');
                }
            });

            socket.on('move', ({ gameId, move }: { gameId: string, move: any }) => {
                const game = this.games.get(gameId);
                if (game) {
                    game.makeMove(socket.id, move);
                    this.io.to(gameId).emit('gameState', game.getState());
                }
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }
}