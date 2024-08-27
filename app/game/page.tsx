'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function Game() {
    const [gameId, setGameId] = useState<string | null>(null);
    const [board, setBoard] = useState<(string | null)[][]>([
        ['A-P1', 'A-P2', 'A-H1', 'A-H2', 'A-P3'],
        [null, null, null, null, null],
        [null, null, null, null, null],
        [null, null, null, null, null],
        ['B-P1', 'B-P2', 'B-H1', 'B-H2', 'B-P3']
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPlayer, setCurrentPlayer] = useState<string>('A');
    const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

    useEffect(() => {
        socketInitializer();
        return () => {
            if (socket) socket.disconnect();
        }
    }, []);

    const socketInitializer = async () => {
        await fetch('/api/socket/io');
        socket = io({
            path: '/api/socket/io',
        });

        socket.on('connect', () => {
            console.log('Connected to server');
            setIsLoading(false);
        });

        socket.on('gameCreated', (id: string) => {
            console.log('Game created with ID:', id);
            setGameId(id);
        });
        
        socket.on('gameState', (state: any) => {
            console.log('Received game state:', state);
            setBoard(state.board);
        });
    };

    const createGame = () => {
        socket.emit('createGame');
    };

    const joinGame = (id: string) => {
        socket.emit('joinGame', id);
    };

    const selectPiece = (piece: string) => {
        setSelectedPiece(piece);
    };

    const makeMove = (direction: string) => {
        if (gameId && selectedPiece) {
            socket.emit('move', { gameId, move: { piece: selectedPiece, direction } });
        }
    };

    return (
        <div className="text-center py-8 bg-gray-800 min-h-screen text-white">
            <h1 className="text-4xl font-bold mb-8">Chess-like Game</h1>
            {!gameId ? (
                <div className="space-y-4">
                    <button onClick={createGame} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">
                        Create New Game
                    </button>
                    <div>
                        <input
                            placeholder="Game ID"
                            onChange={(e) => setGameId(e.target.value)}
                            className="px-4 py-2 border rounded text-black"
                        />
                        <button onClick={() => gameId && joinGame(gameId)} className="ml-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded">
                            Join Game
                        </button>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <h2 className="text-2xl">Game ID: {gameId}</h2>
                    <h3 className="text-xl">Current Player: {currentPlayer}</h3>
                    <div className="grid grid-cols-5 gap-2 mx-auto w-64">
                        {board.map((row, rowIndex) => (
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`border border-gray-700 h-12 w-12 flex items-center justify-center ${cell === selectedPiece ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
                                    onClick={() => selectPiece(cell || '')}
                                >
                                    {cell}
                                </div>
                            ))
                        ))}
                    </div>
                    <div className="text-lg mt-4">
                        Selected: {selectedPiece || 'None'}
                    </div>
                    <div className="space-x-4 mt-4">
                        <button onClick={() => makeMove('L')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">L</button>
                        <button onClick={() => makeMove('R')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">R</button>
                        <button onClick={() => makeMove('F')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">F</button>
                        <button onClick={() => makeMove('B')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded">B</button>
                    </div>
                </div>
            )}
        </div>
    );
}
