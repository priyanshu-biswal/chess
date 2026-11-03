import React, { useMemo, useState } from 'react';
import Board from './components/Board';
import { INITIAL_BOARD } from './utils/chessConstants';
import {
  findKing,
  getAllLegalMoves,
  getLegalMoves,
  isInsufficientMaterial,
  isSquareAttacked,
  isWhite,
} from './utils/chessEngine';

const INITIAL_CASTLING = { K: true, Q: true, k: true, q: true };

const copyBoard = (board) => board.map((row) => [...row]);
const colorName = (color) => (color === 'w' ? 'White' : 'Black');
const squareName = ([row, col]) => `${String.fromCharCode(97 + col)}${8 - row}`;

const positionKey = (board, turn, castling, enPassant) =>
  `${board.map((row) => row.map((piece) => piece || '-').join('')).join('/')} ${turn} ${
    Object.entries(castling)
      .filter(([, available]) => available)
      .map(([side]) => side)
      .join('') || '-'
  } ${enPassant ? squareName(enPassant) : '-'}`;

function getStatus(board, turn, enPassant, castling, halfMoveClock, positionCounts) {
  const legalMoves = getAllLegalMoves(board, turn, enPassant, castling);
  const king = findKing(board, turn);
  const inCheck = Boolean(
    king && isSquareAttacked(king[0], king[1], turn === 'w' ? 'b' : 'w', board),
  );

  if (legalMoves.length === 0) {
    return {
      inCheck,
      legalMoves,
      isOver: true,
      text: inCheck ? `${colorName(turn === 'w' ? 'b' : 'w')} wins by checkmate` : 'Draw by stalemate',
    };
  }
  if (halfMoveClock >= 100) {
    return { inCheck, legalMoves, isOver: true, text: 'Draw by the 50-move rule' };
  }
  if (isInsufficientMaterial(board)) {
    return { inCheck, legalMoves, isOver: true, text: 'Draw by insufficient material' };
  }
  if ((positionCounts[positionKey(board, turn, castling, enPassant)] || 0) >= 3) {
    return { inCheck, legalMoves, isOver: true, text: 'Draw by threefold repetition' };
  }
  return {
    inCheck,
    legalMoves,
    isOver: false,
    text: inCheck ? `${colorName(turn)} is in check` : `${colorName(turn)} to move`,
  };
}

function initialPositionCounts() {
  return { [positionKey(INITIAL_BOARD, 'w', INITIAL_CASTLING, null)]: 1 };
}

export default function App() {
  const [board, setBoard] = useState(() => copyBoard(INITIAL_BOARD));
  const [turn, setTurn] = useState('w');
  const [selected, setSelected] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [enPassant, setEnPassant] = useState(null);
  const [castling, setCastling] = useState(INITIAL_CASTLING);
  const [promotionMove, setPromotionMove] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [halfMoveClock, setHalfMoveClock] = useState(0);
  const [positionCounts, setPositionCounts] = useState(initialPositionCounts);

  const status = useMemo(
    () => getStatus(board, turn, enPassant, castling, halfMoveClock, positionCounts),
    [board, turn, enPassant, castling, halfMoveClock, positionCounts],
  );
  const checkedKing = status.inCheck ? findKing(board, turn) : null;

  const commitMove = (from, to, promotionPiece) => {
    const [fromRow, fromCol] = from;
    const [toRow, toCol] = to;
    const movingPiece = board[fromRow][fromCol];
    const isPawn = movingPiece.toLowerCase() === 'p';
    const isEnPassant =
      isPawn && enPassant?.[0] === toRow && enPassant?.[1] === toCol && !board[toRow][toCol];
    const capturedPiece = isEnPassant
      ? board[turn === 'w' ? toRow + 1 : toRow - 1][toCol]
      : board[toRow][toCol];
    const nextBoard = copyBoard(board);
    nextBoard[fromRow][fromCol] = null;
    if (isEnPassant) nextBoard[turn === 'w' ? toRow + 1 : toRow - 1][toCol] = null;
    nextBoard[toRow][toCol] =
      promotionPiece && isPawn
        ? turn === 'w'
          ? promotionPiece.toUpperCase()
          : promotionPiece
        : movingPiece;

    const nextCastling = { ...castling };
    if (movingPiece === 'K') {
      nextCastling.K = false;
      nextCastling.Q = false;
      if (fromCol - toCol === 2) {
        nextBoard[7][3] = nextBoard[7][0];
        nextBoard[7][0] = null;
      } else if (toCol - fromCol === 2) {
        nextBoard[7][5] = nextBoard[7][7];
        nextBoard[7][7] = null;
      }
    } else if (movingPiece === 'k') {
      nextCastling.k = false;
      nextCastling.q = false;
      if (fromCol - toCol === 2) {
        nextBoard[0][3] = nextBoard[0][0];
        nextBoard[0][0] = null;
      } else if (toCol - fromCol === 2) {
        nextBoard[0][5] = nextBoard[0][7];
        nextBoard[0][7] = null;
      }
    }

    const rookRights = {
      '7,0': 'Q',
      '7,7': 'K',
      '0,0': 'q',
      '0,7': 'k',
    };
    const fromRight = rookRights[`${fromRow},${fromCol}`];
    const capturedRight = rookRights[`${toRow},${toCol}`];
    if (fromRight) nextCastling[fromRight] = false;
    if (capturedRight && capturedPiece?.toLowerCase() === 'r') {
      nextCastling[capturedRight] = false;
    }

    const nextEnPassant =
      isPawn && Math.abs(toRow - fromRow) === 2 ? [(fromRow + toRow) / 2, fromCol] : null;
    const nextTurn = turn === 'w' ? 'b' : 'w';
    const nextHalfMoveClock = isPawn || capturedPiece ? 0 : halfMoveClock + 1;
    const nextKey = positionKey(nextBoard, nextTurn, nextCastling, nextEnPassant);

    setBoard(nextBoard);
    setTurn(nextTurn);
    setCastling(nextCastling);
    setEnPassant(nextEnPassant);
    setLastMove([from, to]);
    setHalfMoveClock(nextHalfMoveClock);
    setPositionCounts((previous) => ({
      ...previous,
      [nextKey]: (previous[nextKey] || 0) + 1,
    }));
    setSelected(null);
    setValidMoves([]);
    setPromotionMove(null);
  };

  const handleSquareClick = (row, col) => {
    if (status.isOver || promotionMove) return;

    if (selected && validMoves.some(([moveRow, moveCol]) => moveRow === row && moveCol === col)) {
      const piece = board[selected[0]][selected[1]];
      if (piece.toLowerCase() === 'p' && (row === 0 || row === 7)) {
        setPromotionMove({ from: selected, to: [row, col] });
      } else {
        commitMove(selected, [row, col]);
      }
      return;
    }

    const piece = board[row][col];
    if (piece && (isWhite(piece) ? 'w' : 'b') === turn) {
      setSelected([row, col]);
      setValidMoves(getLegalMoves(row, col, board, enPassant, castling));
    } else {
      setSelected(null);
      setValidMoves([]);
    }
  };

  return (
    <main className="app-shell">
      <section className="play-area" aria-label="Chess game">
        <Board
          board={board}
          selected={selected}
          validMoves={validMoves}
          promotionMove={promotionMove}
          turn={turn}
          lastMove={lastMove}
          checkedKing={checkedKing}
          onSquareClick={handleSquareClick}
          onPromotionSelect={(piece) => commitMove(promotionMove.from, promotionMove.to, piece)}
        />
      </section>
    </main>
  );
}
