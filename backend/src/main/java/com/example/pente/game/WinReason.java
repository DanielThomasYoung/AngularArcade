package com.example.pente.game;

enum WinReason {
  LINE("line"),
  CAPTURES("captures");

  private final String value;

  WinReason(String value) {
    this.value = value;
  }

  String value() {
    return value;
  }
}
