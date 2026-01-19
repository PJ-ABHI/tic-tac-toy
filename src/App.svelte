<script>
  import { fade, scale, fly } from "svelte/transition";
  import { elasticOut } from "svelte/easing";
  import { getBestMove } from "./lib/ai";

  let board = Array(9).fill(null);
  let turn = "X";
  let winner = null;
  let winningLine = null;

  // Player state
  let playerXName = "";
  let playerOName = "";
  let isVsAI = false;
  let gameStarted = false;
  let scoreX = 0;
  let scoreO = 0;

  const checkWinner = (currentBoard) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // cols
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return { winner: currentBoard[a], line };
      }
    }

    if (!currentBoard.includes(null)) return { winner: "draw", line: null };
    return null;
  };

  const processMove = (i, player) => {
    const newBoard = [...board];
    newBoard[i] = player;
    board = newBoard;

    const result = checkWinner(board);
    if (result) {
      winner = result.winner;
      winningLine = result.line;
      if (winner === "X") scoreX++;
      if (winner === "O") scoreO++;
    } else {
      turn = player === "X" ? "O" : "X";
    }
  };

  const playAI = async () => {
    if (winner) return;
    // Small delay for realism
    await new Promise((r) => setTimeout(r, 500));

    const move = getBestMove(board, "O");
    if (move && move.index !== undefined) {
      processMove(move.index, "O");
    }
  };

  const handleClick = (i) => {
    if (board[i] || winner) return;
    if (isVsAI && turn === "O") return;

    processMove(i, turn);

    if (isVsAI && !winner && turn === "O") {
      playAI();
    }
  };

  const resetGame = () => {
    board = Array(9).fill(null);
    turn = "X";
    winner = null;
    winningLine = null;
  };

  const startGame = () => {
    playerXName = playerXName.trim() || "Player 1";
    if (isVsAI) {
      playerOName = "AI";
    } else {
      playerOName = playerOName.trim() || "Player 2";
    }
    gameStarted = true;
    resetGame();
    scoreX = 0;
    scoreO = 0;
  };

  const quitGame = () => {
    gameStarted = false;
    playerXName = "";
    playerOName = "";
  };

  // Helper to determine if a cell is part of the winning line
  $: isWinningCell = (i) => winningLine && winningLine.includes(i);
</script>

<main>
  <h1>Tic Tac Toy</h1>

  {#if !gameStarted}
    <div class="start-screen glass-card" in:fade>
      <h2>Enter Player Names</h2>
      <div class="mode-toggle">
        <label>
          <input type="checkbox" bind:checked={isVsAI} />
          Play against AI
        </label>
      </div>
      <div class="input-group">
        <label for="p1" class="x-text">Player X</label>
        <input
          id="p1"
          type="text"
          placeholder="Enter Name"
          bind:value={playerXName}
        />
      </div>
      <div class="input-group">
        <label for="p2" class="o-text">Player O</label>
        {#if isVsAI}
          <input id="p2" type="text" value="AI" disabled class="ai-input" />
        {:else}
          <input
            id="p2"
            type="text"
            placeholder="Enter Name"
            bind:value={playerOName}
          />
        {/if}
      </div>
      <button class="start-btn" on:click={startGame}>Start Match</button>
    </div>
  {:else}
    <!-- Scoreboard -->
    <div class="scoreboard" in:fly={{ y: -20, duration: 500 }}>
      <div class="score-card x-score" class:active={turn === "X"}>
        <span class="name">{playerXName} (X)</span>
        <span class="score">{scoreX}</span>
      </div>
      <div class="score-card o-score" class:active={turn === "O"}>
        <span class="name">{playerOName} (O)</span>
        <span class="score">{scoreO}</span>
      </div>
    </div>

    <div class="status glass-card">
      {#if winner}
        {#if winner === "draw"}
          <span class="draw">It's a Draw!</span>
        {:else}
          Winner: <span class={winner === "X" ? "x-text" : "o-text"}>
            {winner === "X" ? playerXName : playerOName}
          </span>
        {/if}
      {:else}
        <span class={turn === "X" ? "x-text" : "o-text"}>
          {turn === "X" ? playerXName : playerOName}'s Turn
        </span>
      {/if}
    </div>

    <div class="board glass-card">
      {#each board as cell, i}
        <button
          class="cell"
          class:highlight={isWinningCell(i)}
          on:click={() => handleClick(i)}
          disabled={!!cell || !!winner}
        >
          {#if cell === "X"}
            <div
              in:scale={{ duration: 400, easing: elasticOut, start: 0.5 }}
              class="mark x-mark"
            >
              ✕
            </div>
          {:else if cell === "O"}
            <div
              in:scale={{ duration: 400, easing: elasticOut, start: 0.5 }}
              class="mark o-mark"
            >
              ◯
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <div class="controls">
      <button class="reset-btn" on:click={resetGame}> Next Round </button>
      <button class="quit-btn" on:click={quitGame}> Quit Match </button>
    </div>
  {/if}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  /* Start Screen Styles */
  .start-screen {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    width: 320px;
  }

  .start-screen h2 {
    margin: 0;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  .input-group label {
    font-weight: bold;
    font-size: 0.9rem;
  }

  input[type="text"] {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 0.8rem;
    color: white;
    font-size: 1rem;
    outline: none;
    transition: all 0.2s;
  }

  input[type="text"]:focus {
    border-color: var(--primary-color);
    background: rgba(0, 0, 0, 0.3);
  }

  .start-btn {
    margin-top: 1rem;
    background: var(--primary-color);
    border: none;
    font-weight: 700;
  }

  .start-btn:hover {
    background: #535bf2;
  }

  /* Scoreboard Styles */
  .scoreboard {
    display: flex;
    gap: 2rem;
    width: 320px;
    justify-content: space-between;
  }

  .score-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem;
    border-radius: 12px;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    flex: 1;
    transition: all 0.3s;
  }

  .score-card.active {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .x-score.active {
    border-color: var(--accent-x);
    box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
  }
  .o-score.active {
    border-color: var(--accent-o);
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.2);
  }

  .name {
    font-size: 0.9rem;
    font-weight: 600;
    opacity: 0.8;
  }
  .score {
    font-size: 1.8rem;
    font-weight: 800;
  }

  .x-score .score {
    color: var(--accent-x);
  }
  .o-score .score {
    color: var(--accent-o);
  }

  .status {
    padding: 1rem 2rem;
    font-size: 1.2rem;
    font-weight: bold;
    min-width: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .x-text {
    color: var(--accent-x);
  }
  .o-text {
    color: var(--accent-o);
  }
  .draw {
    color: var(--text-secondary);
  }

  .board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    padding: 20px;
    width: 320px;
    height: 320px;
  }

  .cell {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cell:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
  }

  /* Remove default disabled style to keep aesthetics */
  .cell:disabled {
    cursor: default;
    background: rgba(255, 255, 255, 0.02);
    border-color: transparent;
  }

  .mark {
    font-size: 3rem;
    line-height: 1;
    font-weight: 900;
  }

  .x-mark {
    color: var(--accent-x);
    text-shadow: 0 0 20px rgba(6, 182, 212, 0.5);
  }

  .o-mark {
    color: var(--accent-o);
    text-shadow: 0 0 20px rgba(236, 72, 153, 0.5);
  }

  .cell.highlight {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .controls {
    display: flex;
    gap: 1rem;
  }

  .reset-btn,
  .quit-btn {
    margin-top: 1rem;
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.05)
    );
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .reset-btn:hover {
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.2),
      rgba(255, 255, 255, 0.1)
    );
    border-color: rgba(255, 255, 255, 0.4);
  }

  .quit-btn {
    background: rgba(239, 68, 68, 0.2);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .quit-btn:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  /* AI Toggle Styles */
  .mode-toggle {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .mode-toggle label {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .mode-toggle input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: var(--primary-color);
  }

  .ai-input {
    opacity: 0.7;
    cursor: not-allowed;
    background: rgba(255, 255, 255, 0.1) !important;
  }
</style>
