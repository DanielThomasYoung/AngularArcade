import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-game1',
  imports: [],
  templateUrl: './game1.html',
  styleUrl: './game1.css',
})
export class Game1 {
  board = signal<number[][]>(Array.from({ length: 40 }, () => new Array(40).fill(0)));

  currentPlayer = signal(1);
  redCaptures = signal(0);
  blueCaptures = signal(0);
  winner = signal(0);

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
      this.winner.set(currentPlayer);
    }
    
    const newCaptures = this.checkForCaptures(rowIndex, colIndex, currentPlayer);

    if (newCaptures > 0) {
      if (currentPlayer === 1) {
        const redCaptures = this.redCaptures() + newCaptures;
        if (redCaptures >= 5) {
          this.winner.set(1);
        }
        this.redCaptures.set(redCaptures);
      } else {
        const blueCaptures = this.blueCaptures() + newCaptures;
        if (blueCaptures >= 5) {
          this.winner.set(2);
        }
        this.blueCaptures.set(blueCaptures);
      }
    }

    this.currentPlayer.set(currentPlayer === 1 ? 2 : 1);
  }

  checkForWin(rowIndex: number, colIndex: number, player: number) {
    // Veritcal
    let sum = 1;
    for (let i = rowIndex + 1; i < 40 && i < rowIndex + 5; i++) {
      if (this.board()[i][colIndex] === player) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = rowIndex - 1; i > rowIndex - 5; i--) {
      if (this.board()[i][colIndex] === player) {
        sum++;
      } else {
        break;
      }
    }
    if (sum >= 5) {
      console.log('win', player);
    }

    // Horizontal
    sum = 1;
    for (let i = colIndex + 1; i < 40 && i < colIndex + 5; i++) {
      if (this.board()[rowIndex][i] === player) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = colIndex - 1; i >= 0 && i > colIndex - 5; i--) {
      if (this.board()[rowIndex][i] === player) {
        sum++;
      } else {
        break;
      }
    }
    if (sum >= 5) {
      return player;
    }

    // Diagonal (top-left to bottom-right)
    sum = 1;
    for (let i = 1; i < 5; i++) {
      if (
        rowIndex + i < 40 &&
        colIndex + i < 40 &&
        this.board()[rowIndex + i][colIndex + i] === player
      ) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = 1; i < 5; i++) {
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
    if (sum >= 5) {
      return player;
    }

    // Diagonal (top-right to bottom-left)
    sum = 1;
    for (let i = 1; i < 5; i++) {
      if (
        rowIndex + i < 40 &&
        colIndex - i >= 0 &&
        this.board()[rowIndex + i][colIndex - i] === player
      ) {
        sum++;
      } else {
        break;
      }
    }
    for (let i = 1; i < 5; i++) {
      if (
        rowIndex - i >= 0 &&
        colIndex + i < 40 &&
        this.board()[rowIndex - i][colIndex + i] === player
      ) {
        sum++;
      } else {
        break;
      }
    }
    if (sum >= 5) {
      return player;
    }

    return 0;
  }

  checkForCaptures(rowIndex: number, colIndex: number, player: number) {
    const opponent = player === 1 ? 2 : 1;
    let totalCaptures = 0;

    // Horizontal right: player, opp, opp, player
    if (
      colIndex + 3 < 100 &&
      this.board()[rowIndex][colIndex + 1] === opponent &&
      this.board()[rowIndex][colIndex + 2] === opponent &&
      this.board()[rowIndex][colIndex + 3] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex] = [...board[rowIndex]];
        newBoard[rowIndex][colIndex + 1] = 0;
        newBoard[rowIndex][colIndex + 2] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    // Horizontal left: player, opp, opp, player
    if (
      colIndex - 3 >= 0 &&
      this.board()[rowIndex][colIndex - 1] === opponent &&
      this.board()[rowIndex][colIndex - 2] === opponent &&
      this.board()[rowIndex][colIndex - 3] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex] = [...board[rowIndex]];
        newBoard[rowIndex][colIndex - 1] = 0;
        newBoard[rowIndex][colIndex - 2] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    // Vertical down: player, opp, opp, player
    if (
      rowIndex + 3 < 100 &&
      this.board()[rowIndex + 1][colIndex] === opponent &&
      this.board()[rowIndex + 2][colIndex] === opponent &&
      this.board()[rowIndex + 3][colIndex] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex + 1] = [...board[rowIndex + 1]];
        newBoard[rowIndex + 2] = [...board[rowIndex + 2]];
        newBoard[rowIndex + 1][colIndex] = 0;
        newBoard[rowIndex + 2][colIndex] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    // Vertical up: player, opp, opp, player
    if (
      rowIndex - 3 >= 0 &&
      this.board()[rowIndex - 1][colIndex] === opponent &&
      this.board()[rowIndex - 2][colIndex] === opponent &&
      this.board()[rowIndex - 3][colIndex] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex - 1] = [...board[rowIndex - 1]];
        newBoard[rowIndex - 2] = [...board[rowIndex - 2]];
        newBoard[rowIndex - 1][colIndex] = 0;
        newBoard[rowIndex - 2][colIndex] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    // Diagonal down-right: player, opp, opp, player
    if (
      rowIndex + 3 < 100 &&
      colIndex + 3 < 100 &&
      this.board()[rowIndex + 1][colIndex + 1] === opponent &&
      this.board()[rowIndex + 2][colIndex + 2] === opponent &&
      this.board()[rowIndex + 3][colIndex + 3] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex + 1] = [...board[rowIndex + 1]];
        newBoard[rowIndex + 2] = [...board[rowIndex + 2]];
        newBoard[rowIndex + 1][colIndex + 1] = 0;
        newBoard[rowIndex + 2][colIndex + 2] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    // Diagonal up-left: player, opp, opp, player
    if (
      rowIndex - 3 >= 0 &&
      colIndex - 3 >= 0 &&
      this.board()[rowIndex - 1][colIndex - 1] === opponent &&
      this.board()[rowIndex - 2][colIndex - 2] === opponent &&
      this.board()[rowIndex - 3][colIndex - 3] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex - 1] = [...board[rowIndex - 1]];
        newBoard[rowIndex - 2] = [...board[rowIndex - 2]];
        newBoard[rowIndex - 1][colIndex - 1] = 0;
        newBoard[rowIndex - 2][colIndex - 2] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    // Diagonal down-left: player, opp, opp, player
    if (
      rowIndex + 3 < 100 &&
      colIndex - 3 >= 0 &&
      this.board()[rowIndex + 1][colIndex - 1] === opponent &&
      this.board()[rowIndex + 2][colIndex - 2] === opponent &&
      this.board()[rowIndex + 3][colIndex - 3] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex + 1] = [...board[rowIndex + 1]];
        newBoard[rowIndex + 2] = [...board[rowIndex + 2]];
        newBoard[rowIndex + 1][colIndex - 1] = 0;
        newBoard[rowIndex + 2][colIndex - 2] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    // Diagonal up-right: player, opp, opp, player
    if (
      rowIndex - 3 >= 0 &&
      colIndex + 3 < 100 &&
      this.board()[rowIndex - 1][colIndex + 1] === opponent &&
      this.board()[rowIndex - 2][colIndex + 2] === opponent &&
      this.board()[rowIndex - 3][colIndex + 3] === player
    ) {
      this.board.update((board) => {
        const newBoard = [...board];
        newBoard[rowIndex - 1] = [...board[rowIndex - 1]];
        newBoard[rowIndex - 2] = [...board[rowIndex - 2]];
        newBoard[rowIndex - 1][colIndex + 1] = 0;
        newBoard[rowIndex - 2][colIndex + 2] = 0;
        return newBoard;
      });
      totalCaptures += 1;
    }

    return totalCaptures;
  }

  newGame() {
    this.board.set(Array.from({ length: 40 }, () => Array.from({ length: 40 }, () => 0)));
    this.currentPlayer.set(1);
    this.redCaptures.set(0);
    this.blueCaptures.set(0);
    this.winner.set(0);
  }
}
