
export function getBestMove(board, aiPlayer = "O", difficulty = "top") {
    const huPlayer = aiPlayer === "O" ? "X" : "O";

    // Helper to check for a win within the simulation
    const checkWin = (currentBoard, player) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let line of lines) {
            const [a, b, c] = line;
            if (currentBoard[a] === player && currentBoard[b] === player && currentBoard[c] === player) {
                return true;
            }
        }
        return false;
    };

    // Minimax algorithm
    const minimax = (newBoard, player) => {
        const availSpots = newBoard.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);

        if (checkWin(newBoard, huPlayer)) return { score: -10 };
        if (checkWin(newBoard, aiPlayer)) return { score: 10 };
        if (availSpots.length === 0) return { score: 0 };

        const moves = [];

        for (let i = 0; i < availSpots.length; i++) {
            const move = {};
            move.index = availSpots[i];

            // Try the move
            newBoard[availSpots[i]] = player;

            if (player === aiPlayer) {
                const result = minimax(newBoard, huPlayer);
                move.score = result.score;
            } else {
                const result = minimax(newBoard, aiPlayer);
                move.score = result.score;
            }

            // Reset the board
            newBoard[availSpots[i]] = null;
            moves.push(move);
        }

        let bestMove;
        if (player === aiPlayer) {
            let bestScore = -10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = 10000;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    };

    const availSpots = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
    if (availSpots.length === 0) return null;

    // Helper to get a random move
    const getRandomMove = () => {
        const randomIndex = Math.floor(Math.random() * availSpots.length);
        return { index: availSpots[randomIndex] };
    };

    // Make mistakes based on difficulty
    // beginner: 30% chance of optimal move (70% random)
    // middle: 70% chance of optimal move (30% random)
    // top: 100% chance of optimal move

    const randomChance = Math.random();

    let threshold = 1.0; // Default to top (always optimal)
    if (difficulty === 'beginner') threshold = 0.3;
    if (difficulty === 'middle') threshold = 0.7;

    if (randomChance > threshold) {
        return getRandomMove();
    }

    return minimax(board, aiPlayer);
}
