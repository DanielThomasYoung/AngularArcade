package com.example.pente.game;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class GameServiceTest {
  private GameService gameService;

  @BeforeEach
  void setUp() {
    gameService = new GameService(new PenteRules());
  }

  @Test
  void createsANewGame() {
    GameResponse game = gameService.createGame();

    assertThat(game.id()).isNotNull();
    assertThat(game.board()).hasDimensions(19, 19);
    assertThat(game.currentPlayer()).isEqualTo(1);
    assertThat(game.winner()).isZero();
  }

  @Test
  void placesAStoneAtTheLowerRightEdge() {
    GameResponse game = gameService.createGame();

    GameResponse updated = gameService.makeMove(game.id(), new MoveRequest(18, 18));

    assertThat(updated.board()[18][18]).isEqualTo(1);
    assertThat(updated.currentPlayer()).isEqualTo(2);
  }

  @Test
  void rejectsAnOccupiedSquare() {
    GameResponse game = gameService.createGame();
    gameService.makeMove(game.id(), new MoveRequest(0, 0));

    assertThatThrownBy(() -> gameService.makeMove(game.id(), new MoveRequest(0, 0)))
        .isInstanceOf(InvalidMoveException.class)
        .hasMessage("That square is already occupied.");
  }

  @Test
  void capturesAcrossTheTopEdge() {
    GameState game = new GameState(UUID.randomUUID());
    game.board[0][1] = 2;
    game.board[0][2] = 2;
    game.board[0][3] = 1;

    new PenteRules().makeMove(game, 0, 0);

    assertThat(game.board[0][0]).isEqualTo(1);
    assertThat(game.board[0][1]).isZero();
    assertThat(game.board[0][2]).isZero();
    assertThat(game.redCaptures).isEqualTo(1);
  }

  @Test
  void winsWithFiveInARow() {
    GameState game = new GameState(UUID.randomUUID());
    game.board[0][0] = 1;
    game.board[0][1] = 1;
    game.board[0][2] = 1;
    game.board[0][3] = 1;

    new PenteRules().makeMove(game, 0, 4);

    assertThat(game.winner).isEqualTo(1);
    assertThat(game.winReason).isEqualTo(WinReason.LINE);
  }

  @Test
  void winsWithFiveCaptures() {
    GameState game = new GameState(UUID.randomUUID());
    game.redCaptures = 4;
    game.board[0][1] = 2;
    game.board[0][2] = 2;
    game.board[0][3] = 1;

    new PenteRules().makeMove(game, 0, 0);

    assertThat(game.winner).isEqualTo(1);
    assertThat(game.winReason).isEqualTo(WinReason.CAPTURES);
  }

  @Test
  void restartsAGame() {
    GameResponse game = gameService.createGame();
    gameService.makeMove(game.id(), new MoveRequest(0, 0));

    GameResponse restarted = gameService.restartGame(game.id());

    assertThat(restarted.board()[0][0]).isZero();
    assertThat(restarted.currentPlayer()).isEqualTo(1);
    assertThat(restarted.redCaptures()).isZero();
    assertThat(restarted.blueCaptures()).isZero();
    assertThat(restarted.winner()).isZero();
    assertThat(restarted.winReason()).isNull();
  }
}
