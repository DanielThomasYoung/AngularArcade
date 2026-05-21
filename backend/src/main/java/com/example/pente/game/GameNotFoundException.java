package com.example.pente.game;

class GameNotFoundException extends RuntimeException {
  GameNotFoundException(String gameId) {
    super("Game not found: " + gameId);
  }
}
