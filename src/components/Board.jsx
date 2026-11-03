import React from 'react';
import Square from './Square';
import PromotionModal from './PromotionModal';

export default function Board({
  board,
  selected,
  validMoves,
  promotionMove,
  turn,
  lastMove,
  checkedKing,
  onSquareClick,
  onPromotionSelect,
}) {
  return (
    <div className="board-frame">
      <div className="board" role="grid" aria-label="Chess board">
        {board.map((row, r) =>
          row.map((piece, c) => {
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isValidTarget = validMoves.some(([moveRow, moveCol]) => moveRow === r && moveCol === c);
            const isLastMoveSquare = lastMove?.some(
              ([moveRow, moveCol]) => moveRow === r && moveCol === c,
            );
            const isCheckedKing = checkedKing?.[0] === r && checkedKing?.[1] === c;

            return (
              <Square
                key={`${r}-${c}`}
                r={r}
                c={c}
                piece={piece}
                isSelected={isSelected}
                isValidTarget={isValidTarget}
                isLastMove={isLastMoveSquare}
                isInCheck={isCheckedKing}
                onClick={() => onSquareClick(r, c)}
              />
            );
          }),
        )}
      </div>
      {promotionMove && <PromotionModal turn={turn} onSelect={onPromotionSelect} />}
    </div>
  );
}
