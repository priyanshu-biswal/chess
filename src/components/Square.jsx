import React from 'react';
import { PIECE_SYMBOLS } from '../utils/chessConstants';
import { isWhite } from '../utils/chessEngine';

export default function Square({
  r,
  c,
  piece,
  isSelected,
  isValidTarget,
  isLastMove,
  isInCheck,
  onClick,
}) {
  const isDark = (r + c) % 2 === 1;
  const squareName = `${String.fromCharCode(97 + c)}${8 - r}`;

  return (
    <button
      type="button"
      aria-label={`${squareName}${piece ? ` ${piece}` : ''}${isValidTarget ? ', legal move' : ''}`}
      aria-pressed={isSelected}
      onClick={onClick}
      className={`square ${isDark ? 'square--dark' : 'square--light'}${
        isSelected ? ' square--selected' : ''
      }${isLastMove ? ' square--last-move' : ''}${isInCheck ? ' square--check' : ''}`}
    >
      {c === 0 && <span className="coordinate coordinate--rank">{8 - r}</span>}
      {r === 7 && (
        <span className="coordinate coordinate--file">{String.fromCharCode(97 + c)}</span>
      )}
      {piece && (
        <span className={`piece ${isWhite(piece) ? 'piece--white' : 'piece--black'}`}>
          {PIECE_SYMBOLS[piece]}
        </span>
      )}
      {isValidTarget && (
        <span
          aria-hidden="true"
          className={`move-indicator${piece ? ' move-indicator--capture' : ''}`}
        />
      )}
    </button>
  );
}
