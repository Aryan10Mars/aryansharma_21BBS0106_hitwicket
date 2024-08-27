export class Game {
    players: string[] = [];
    board: (string | null)[][] = [];
    currentTurn: number = 0;

    constructor() {
        this.initializeBoard();
    }

    private initializeBoard() {
        this.board = Array(5).fill(null).map(() => Array(5).fill(null));
        const playerAPieces = ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'];
        const playerBPieces = ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3'];
        
        for (let i = 0; i < 5; i++) {
            this.board[0][i] = playerAPieces[i];
            this.board[4][i] = playerBPieces[i];
        }
    }


    addPlayer(playerId: string) {
        if (this.players.length < 2) {
            this.players.push(playerId);
        }
    }

    makeMove(playerId: string, move: any) {
    }

    getState() {
        return {
            board: this.board,
            currentTurn: this.currentTurn,
            players: this.players
        };
    }
}