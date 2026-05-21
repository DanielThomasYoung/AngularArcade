package com.example.pente.game;

public record GameResponse(
    String id,
    int[][] board,
    int currentPlayer,
    int redCaptures,
    int blueCaptures,
    int winner,
    String winReason) {

  static GameResponse from(GameState game) {
    return new GameResponse(
        game.id,
        copyBoard(game.board),
        game.currentPlayer,
        game.redCaptures,
        game.blueCaptures,
        game.winner,
        game.winReason == null ? null : game.winReason.value());
  }

  private static int[][] copyBoard(int[][] board) {
    int[][] copy = new int[board.length][];

    for (int row = 0; row < board.length; row++) {
      copy[row] = board[row].clone();
    }

    return copy;
  }
}
