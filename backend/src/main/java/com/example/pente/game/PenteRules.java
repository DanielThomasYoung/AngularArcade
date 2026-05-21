package com.example.pente.game;

import org.springframework.stereotype.Service;

@Service
class PenteRules {
  private static final int BOARD_SIZE = GameState.BOARD_SIZE;
  private static final int WIN_LENGTH = 5;
  private static final int[][] CAPTURE_DIRECTIONS = {
    {0, 1},
    {0, -1},
    {1, 0},
    {-1, 0},
    {1, 1},
    {-1, -1},
    {1, -1},
    {-1, 1}
  };

  void makeMove(GameState game, int row, int col) {
    if (!isInBounds(row, col)) {
      throw new InvalidMoveException("Move is outside the board.");
    }

    if (game.winner != 0) {
      throw new InvalidMoveException("Game is already over.");
    }

    if (game.board[row][col] != 0) {
      throw new InvalidMoveException("That square is already occupied.");
    }

    int player = game.currentPlayer;
    game.board[row][col] = player;

    if (hasFiveInARow(game.board, row, col, player)) {
      setWinner(game, player, WinReason.LINE);
    }

    int captures = applyCaptures(game.board, row, col, player);

    if (captures > 0) {
      if (player == 1) {
        game.redCaptures += captures;
        if (game.redCaptures >= 5) {
          setWinner(game, player, WinReason.CAPTURES);
        }
      } else {
        game.blueCaptures += captures;
        if (game.blueCaptures >= 5) {
          setWinner(game, player, WinReason.CAPTURES);
        }
      }
    }

    game.currentPlayer = player == 1 ? 2 : 1;
  }

  private boolean hasFiveInARow(int[][] board, int row, int col, int player) {
    return countLine(board, row, col, player, 1, 0) >= WIN_LENGTH
        || countLine(board, row, col, player, 0, 1) >= WIN_LENGTH
        || countLine(board, row, col, player, 1, 1) >= WIN_LENGTH
        || countLine(board, row, col, player, 1, -1) >= WIN_LENGTH;
  }

  private int countLine(int[][] board, int row, int col, int player, int rowDirection, int colDirection) {
    return 1
        + countDirection(board, row, col, player, rowDirection, colDirection)
        + countDirection(board, row, col, player, -rowDirection, -colDirection);
  }

  private int countDirection(int[][] board, int row, int col, int player, int rowDirection, int colDirection) {
    int count = 0;

    for (int distance = 1; distance < WIN_LENGTH; distance++) {
      int nextRow = row + rowDirection * distance;
      int nextCol = col + colDirection * distance;

      if (!isInBounds(nextRow, nextCol) || board[nextRow][nextCol] != player) {
        break;
      }

      count++;
    }

    return count;
  }

  private int applyCaptures(int[][] board, int row, int col, int player) {
    int opponent = player == 1 ? 2 : 1;
    int totalCaptures = 0;

    for (int[] direction : CAPTURE_DIRECTIONS) {
      int firstRow = row + direction[0];
      int firstCol = col + direction[1];
      int secondRow = row + direction[0] * 2;
      int secondCol = col + direction[1] * 2;
      int anchorRow = row + direction[0] * 3;
      int anchorCol = col + direction[1] * 3;

      if (!isInBounds(firstRow, firstCol)
          || !isInBounds(secondRow, secondCol)
          || !isInBounds(anchorRow, anchorCol)) {
        continue;
      }

      if (board[firstRow][firstCol] == opponent
          && board[secondRow][secondCol] == opponent
          && board[anchorRow][anchorCol] == player) {
        board[firstRow][firstCol] = 0;
        board[secondRow][secondCol] = 0;
        totalCaptures++;
      }
    }

    return totalCaptures;
  }

  private boolean isInBounds(int row, int col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }

  private void setWinner(GameState game, int player, WinReason reason) {
    if (game.winner != 0) {
      return;
    }

    game.winner = player;
    game.winReason = reason;
  }
}
