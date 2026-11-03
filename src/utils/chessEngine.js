export const isWhite = (piece) => Boolean(piece && piece === piece.toUpperCase());
export const isBlack = (piece) => Boolean(piece && piece === piece.toLowerCase());
export const isSameColor = (first, second) =>
  (isWhite(first) && isWhite(second)) || (isBlack(first) && isBlack(second));

export const findKing = (board, color) => {
  const king = color === 'w' ? 'K' : 'k';
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (board[row][col] === king) return [row, col];
    }
  }
  return null;
};

const isOnBoard = (row, col) => row >= 0 && row < 8 && col >= 0 && col < 8;

export const getPseudoMoves = (row, col, board, enPassant, castling) => {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const color = isWhite(piece) ? 'w' : 'b';
  const direction = color === 'w' ? -1 : 1;
  const addIfAvailable = (targetRow, targetCol) => {
    if (
      isOnBoard(targetRow, targetCol) &&
      (!board[targetRow][targetCol] || !isSameColor(piece, board[targetRow][targetCol]))
    ) {
      moves.push([targetRow, targetCol]);
    }
  };

  if (piece.toLowerCase() === 'p') {
    const startRow = color === 'w' ? 6 : 1;
    const nextRow = row + direction;
    if (isOnBoard(nextRow, col) && !board[nextRow][col]) {
      moves.push([nextRow, col]);
      if (row === startRow && !board[row + 2 * direction][col]) {
        moves.push([row + 2 * direction, col]);
      }
    }

    for (const deltaCol of [-1, 1]) {
      const targetRow = row + direction;
      const targetCol = col + deltaCol;
      if (!isOnBoard(targetRow, targetCol)) continue;
      const target = board[targetRow][targetCol];
      if (target && !isSameColor(piece, target)) {
        moves.push([targetRow, targetCol]);
      }
      if (enPassant?.[0] === targetRow && enPassant?.[1] === targetCol) {
        moves.push([targetRow, targetCol]);
      }
    }
  } else if (piece.toLowerCase() === 'n') {
    for (const [deltaRow, deltaCol] of [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ]) {
      addIfAvailable(row + deltaRow, col + deltaCol);
    }
  } else if (['r', 'b', 'q'].includes(piece.toLowerCase())) {
    const orthogonal = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const diagonal = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    const directions =
      piece.toLowerCase() === 'r'
        ? orthogonal
        : piece.toLowerCase() === 'b'
          ? diagonal
          : [...orthogonal, ...diagonal];

    for (const [deltaRow, deltaCol] of directions) {
      let targetRow = row + deltaRow;
      let targetCol = col + deltaCol;
      while (isOnBoard(targetRow, targetCol)) {
        const target = board[targetRow][targetCol];
        if (!target) {
          moves.push([targetRow, targetCol]);
        } else {
          if (!isSameColor(piece, target)) {
            moves.push([targetRow, targetCol]);
          }
          break;
        }
        targetRow += deltaRow;
        targetCol += deltaCol;
      }
    }
  } else if (piece.toLowerCase() === 'k') {
    for (const [deltaRow, deltaCol] of [
      [-1, -1], [-1, 0], [-1, 1], [0, -1],
      [0, 1], [1, -1], [1, 0], [1, 1],
    ]) {
      addIfAvailable(row + deltaRow, col + deltaCol);
    }

    if (color === 'w' && row === 7 && col === 4) {
      if (castling?.K && board[7][7] === 'R' && !board[7][5] && !board[7][6]) {
        moves.push([7, 6]);
      }
      if (
        castling?.Q &&
        board[7][0] === 'R' &&
        !board[7][1] &&
        !board[7][2] &&
        !board[7][3]
      ) {
        moves.push([7, 2]);
      }
    } else if (color === 'b' && row === 0 && col === 4) {
      if (castling?.k && board[0][7] === 'r' && !board[0][5] && !board[0][6]) {
        moves.push([0, 6]);
      }
      if (
        castling?.q &&
        board[0][0] === 'r' &&
        !board[0][1] &&
        !board[0][2] &&
        !board[0][3]
      ) {
        moves.push([0, 2]);
      }
    }
  }

  return moves;
};

export const isSquareAttacked = (targetRow, targetCol, attackerColor, board) => {
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (!piece || (isWhite(piece) ? 'w' : 'b') !== attackerColor) continue;

      if (piece.toLowerCase() === 'p') {
        const direction = attackerColor === 'w' ? -1 : 1;
        if (
          row + direction === targetRow &&
          (col - 1 === targetCol || col + 1 === targetCol)
        ) {
          return true;
        }
      } else if (
        getPseudoMoves(row, col, board, null, null).some(
          ([moveRow, moveCol]) => moveRow === targetRow && moveCol === targetCol,
        )
      ) {
        return true;
      }
    }
  }
  return false;
};

export const getLegalMoves = (row, col, board, enPassant, castling) => {
  const piece = board[row][col];
  if (!piece) return [];

  const color = isWhite(piece) ? 'w' : 'b';
  const opponentColor = color === 'w' ? 'b' : 'w';
  return getPseudoMoves(row, col, board, enPassant, castling).filter(
    ([targetRow, targetCol]) => {
      if (board[targetRow][targetCol]?.toLowerCase() === 'k') return false;
      if (piece.toLowerCase() === 'k' && Math.abs(targetCol - col) === 2) {
        const passCol = targetCol > col ? col + 1 : col - 1;
        if (
          isSquareAttacked(row, col, opponentColor, board) ||
          isSquareAttacked(row, passCol, opponentColor, board)
        ) {
          return false;
        }
      }

      const nextBoard = board.map((boardRow) => [...boardRow]);
      nextBoard[targetRow][targetCol] = piece;
      nextBoard[row][col] = null;

      if (
        piece.toLowerCase() === 'p' &&
        enPassant?.[0] === targetRow &&
        enPassant?.[1] === targetCol
      ) {
        nextBoard[color === 'w' ? targetRow + 1 : targetRow - 1][targetCol] = null;
      }

      const king = findKing(nextBoard, color);
      return Boolean(king && !isSquareAttacked(king[0], king[1], opponentColor, nextBoard));
    },
  );
};

export const getAllLegalMoves = (board, color, enPassant, castling) => {
  const moves = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const piece = board[row][col];
      if (piece && (isWhite(piece) ? 'w' : 'b') === color) {
        for (const [targetRow, targetCol] of getLegalMoves(
          row,
          col,
          board,
          enPassant,
          castling,
        )) {
          moves.push({ from: [row, col], to: [targetRow, targetCol] });
        }
      }
    }
  }
  return moves;
};

export const isInsufficientMaterial = (board) => {
  const pieces = board.flat().filter(Boolean);
  const material = pieces.filter((piece) => !['k', 'K'].includes(piece));
  if (material.length === 0) return true;
  if (material.some((piece) => ['p', 'r', 'q', 'P', 'R', 'Q'].includes(piece))) {
    return false;
  }
  if (material.length === 1) return true;

  const bishops = material.filter((piece) => piece.toLowerCase() === 'b');
  if (bishops.length !== material.length) return false;
  const bishopSquareColors = [];
  for (let row = 0; row < 8; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      if (board[row][col]?.toLowerCase() === 'b') bishopSquareColors.push((row + col) % 2);
    }
  }
  return bishopSquareColors.every((color) => color === bishopSquareColors[0]);
};
