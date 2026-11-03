import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_BOARD } from './chessConstants.js';
import {
  getAllLegalMoves,
  getLegalMoves,
  isInsufficientMaterial,
} from './chessEngine.js';

const emptyBoard = () => Array.from({ length: 8 }, () => Array(8).fill(null));

test('initial position has 20 legal moves for each side', () => {
  const board = INITIAL_BOARD.map((row) => [...row]);
  assert.equal(getAllLegalMoves(board, 'w', null, { K: true, Q: true, k: true, q: true }).length, 20);
  assert.equal(getAllLegalMoves(board, 'b', null, { K: true, Q: true, k: true, q: true }).length, 20);
});

test('does not allow a move that leaves the king in check', () => {
  const board = emptyBoard();
  board[7][4] = 'K';
  board[0][4] = 'k';
  board[1][4] = 'r';
  board[6][3] = 'P';

  assert.deepEqual(getLegalMoves(6, 3, board, null, {}), []);
});

test('castling requires a rook and an unattacked path', () => {
  const board = emptyBoard();
  board[7][4] = 'K';
  board[7][7] = 'R';
  board[0][4] = 'k';
  const rights = { K: true };
  assert.ok(getLegalMoves(7, 4, board, null, rights).some(([row, col]) => row === 7 && col === 6));

  board[0][5] = 'r';
  assert.ok(!getLegalMoves(7, 4, board, null, rights).some(([row, col]) => row === 7 && col === 6));
});

test('en passant is legal unless it exposes the moving side king', () => {
  const board = emptyBoard();
  board[3][4] = 'K';
  board[0][0] = 'k';
  board[3][5] = 'P';
  board[3][6] = 'p';

  assert.ok(getLegalMoves(3, 5, board, [2, 6], {}).some(([row, col]) => row === 2 && col === 6));

  board[3][7] = 'r';
  assert.ok(!getLegalMoves(3, 5, board, [2, 6], {}).some(([row, col]) => row === 2 && col === 6));
});

test('detects insufficient material but not a position with a rook', () => {
  const board = emptyBoard();
  board[7][4] = 'K';
  board[0][4] = 'k';
  assert.equal(isInsufficientMaterial(board), true);

  board[1][0] = 'r';
  assert.equal(isInsufficientMaterial(board), false);
});
