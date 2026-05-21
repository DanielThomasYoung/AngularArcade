import { Component, signal } from '@angular/core';

const BOARD_SIZE = 19;
const WIN_LENGTH = 5;
const CAPTURE_DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
] as const;

type WinReason = 'line' | 'captures';

@Component({
  selector: 'app-pente',
  imports: [],
  templateUrl: './pente.html',
  styleUrl: './pente.css',
})
export class Pente {
  board = signal<number[][]>(this.createEmptyBoard());

  currentPlayer = signal(1);
  redCaptures = signal(0);
  blueCaptures = signal(0);
  winner = signal(0);
  winReason = signal<WinReason | null>(null);

  makeMove(rowIndex: number, colIndex: number) {
    if (this.board()[rowIndex][colIndex] || this.winner()) {
      return;
    }

    const currentPlayer = this.currentPlayer();

    this.board.update((board) => {
      const newBoard = [...board]; // Shallow copy of rows
      newBoard[rowIndex] = [...board[rowIndex]]; // Copy only the affected row
      newBoard[rowIndex][colIndex] = currentPlayer;
      return newBoard;
    });

    if (this.checkForWin(rowIndex, colIndex, currentPlayer)) {
      this.setWinner(currentPlayer, 'line');
    }

    const newCaptures = this.checkForCaptures(rowIndex, colIndex, currentPlayer);

    if (newCaptures > 0) {
      if (currentPlayer === 1) {
        const redCaptures = this.redCaptures() + newCaptures;
        if (redCaptures >= 5) {
          this.setWinner(1, 'captures');
        }
        this.redCaptures.set(redCaptures);
      } else {
        const blueCaptures = this.blueCaptures() + newCaptures;
        if (blueCaptures >= 5) {
          this.setWinner(2, 'captures');
        }
        this.blueCaptures.set(blueCaptures);
      }
    }

    this.currentPlayer.set(currentPlayer === 1 ? 2 : 1);
  }

  winnerName() {
    return this.winner() === 1 ? 'Red' : 'Blue';
  }

  winSummary() {
    if (this.winReason() === 'line') {
      return `${this.winnerName()} wins with 5 in a row`;
    }

    if (this.winReason() === 'captures') {
      return `${this.winnerName()} wins with 5 captures`;
    }

    return `${this.winnerName()} wins`;
  }

  checkForWin(rowIndex: number, colIndex: number, player: number) {
    // Vertical
    let sum = 1;
    for (let i = rowIndex + 1; i < BOARD_SIZE && i < rowIndex + WIN_LENGTH; i++) {
      if (this.board()[i][colIndex] === player) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = rowIndex - 1; i >= 0 && i > rowIndex - WIN_LENGTH; i--) {
      if (this.board()[i][colIndex] === player) {
        sum++;
      } else {
        break;
      }
    }
    if (sum >= WIN_LENGTH) {
      return player;
    }

    // Horizontal
    sum = 1;
    for (let i = colIndex + 1; i < BOARD_SIZE && i < colIndex + WIN_LENGTH; i++) {
      if (this.board()[rowIndex][i] === player) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = colIndex - 1; i >= 0 && i > colIndex - WIN_LENGTH; i--) {
      if (this.board()[rowIndex][i] === player) {
        sum++;
      } else {
        break;
      }
    }
    if (sum >= WIN_LENGTH) {
      return player;
    }

    // Diagonal (top-left to bottom-right)
    sum = 1;
    for (let i = 1; i < WIN_LENGTH; i++) {
      if (
        rowIndex + i < BOARD_SIZE &&
        colIndex + i < BOARD_SIZE &&
        this.board()[rowIndex + i][colIndex + i] === player
      ) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      if (
        rowIndex - i >= 0 &&
        colIndex - i >= 0 &&
        this.board()[rowIndex - i][colIndex - i] === player
      ) {
        sum++;
      } else {
        break;
      }
    }
    if (sum >= WIN_LENGTH) {
      return player;
    }

    // Diagonal (top-right to bottom-left)
    sum = 1;
    for (let i = 1; i < WIN_LENGTH; i++) {
      if (
        rowIndex + i < BOARD_SIZE &&
        colIndex - i >= 0 &&
        this.board()[rowIndex + i][colIndex - i] === player
      ) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      if (
        rowIndex - i >= 0 &&
        colIndex + i < BOARD_SIZE &&
        this.board()[rowIndex - i][colIndex + i] === player
      ) {
        sum++;
      } else {
        break;
      }
    }
    if (sum >= WIN_LENGTH) {
      return player;
    }

    return 0;
  }

  checkForCaptures(rowIndex: number, colIndex: number, player: number) {
    const opponent = player === 1 ? 2 : 1;
    let totalCaptures = 0;

    for (const [rowDirection, colDirection] of CAPTURE_DIRECTIONS) {
      const firstRow = rowIndex + rowDirection;
      const firstCol = colIndex + colDirection;
      const secondRow = rowIndex + rowDirection * 2;
      const secondCol = colIndex + colDirection * 2;
      const anchorRow = rowIndex + rowDirection * 3;
      const anchorCol = colIndex + colDirection * 3;

      if (
        !this.isInBounds(firstRow, firstCol) ||
        !this.isInBounds(secondRow, secondCol) ||
        !this.isInBounds(anchorRow, anchorCol)
      ) {
        continue;
      }

      if (
        this.board()[firstRow][firstCol] === opponent &&
        this.board()[secondRow][secondCol] === opponent &&
        this.board()[anchorRow][anchorCol] === player
      ) {
        this.board.update((board) => {
          const newBoard = [...board];
          const rowsToCopy = new Set([firstRow, secondRow]);

          for (const row of rowsToCopy) {
            newBoard[row] = [...board[row]];
          }

          newBoard[firstRow][firstCol] = 0;
          newBoard[secondRow][secondCol] = 0;

          return newBoard;
        });
        totalCaptures += 1;
      }
    }

    return totalCaptures;
  }

  newGame() {
    this.board.set(this.createEmptyBoard());
    this.currentPlayer.set(1);
    this.redCaptures.set(0);
    this.blueCaptures.set(0);
    this.winner.set(0);
    this.winReason.set(null);
  }

  private createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => 0));
  }

  private isInBounds(rowIndex: number, colIndex: number) {
    return rowIndex >= 0 && rowIndex < BOARD_SIZE && colIndex >= 0 && colIndex < BOARD_SIZE;
  }

  private setWinner(player: number, reason: WinReason) {
    if (this.winner()) {
      return;
    }

    this.winner.set(player);
    this.winReason.set(reason);
  }
}
