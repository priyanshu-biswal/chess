import React from 'react';
import { PIECE_SYMBOLS } from '../utils/chessConstants';

export default function PromotionModal({ turn, onSelect }) {
  return (
    <div className="promotion-backdrop">
      <section
        aria-labelledby="promotion-title"
        aria-modal="true"
        className="promotion-dialog"
        role="dialog"
      >
        <p id="promotion-title">Promote your pawn</p>
        <div className="promotion-options">
          {['q', 'r', 'b', 'n'].map((piece) => (
            <button
              aria-label={`Promote to ${piece === 'q' ? 'queen' : piece === 'r' ? 'rook' : piece === 'b' ? 'bishop' : 'knight'}`}
              className="promotion-option"
              key={piece}
              onClick={() => onSelect(piece)}
              type="button"
            >
              {PIECE_SYMBOLS[turn === 'w' ? piece.toUpperCase() : piece]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
