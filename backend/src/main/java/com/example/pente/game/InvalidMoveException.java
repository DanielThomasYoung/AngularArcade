package com.example.pente.game;

class InvalidMoveException extends RuntimeException {
  InvalidMoveException(String message) {
    super(message);
  }
}
