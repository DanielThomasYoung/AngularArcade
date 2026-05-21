package com.example.pente.game;

class GameState {
  static final int BOARD_SIZE = 19;

  final String id;
  final int[][] board;
  int currentPlayer = 1;
  int redCaptures = 0;
  int blueCaptures = 0;
  int winner = 0;
  WinReason winReason = null;

  GameState(String id) {
    this.id = id;
    this.board = new int[BOARD_SIZE][BOARD_SIZE];
  }

  void reset() {
    for (int row = 0; row < BOARD_SIZE; row++) {
      for (int col = 0; col < BOARD_SIZE; col++) {
        board[row][col] = 0;
      }
    }

    currentPlayer = 1;
    redCaptures = 0;
    blueCaptures = 0;
    winner = 0;
    winReason = null;
  }
}
