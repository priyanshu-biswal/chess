# Chess

A responsive, local two-player chess game built with React and Vite. Play on the same device with legal move highlighting, check and checkmate detection, castling, en passant, and pawn promotion.

## Requirements

- Node.js 18 or newer
- npm

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed by Vite. To create and preview a production build:

```powershell
npm.cmd run build
npm.cmd run preview
```

## Tests

```powershell
npm.cmd test
```

## How to play

- Select one of your pieces, then select a highlighted destination.
- Choose a queen, rook, bishop, or knight when a pawn reaches the far rank.
- Use **New game** to reset the board.
- The game detects check, checkmate, stalemate, threefold repetition, the 50-move rule, and insufficient material.

This is a local two-player game. It does not include online play, a computer opponent, or saved games.
