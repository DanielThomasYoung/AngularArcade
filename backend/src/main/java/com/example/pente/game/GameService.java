package com.example.pente.game;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Service;

@Service
class GameService {
  private final ConcurrentMap<UUID, GameState> games = new ConcurrentHashMap<>();
  private final PenteRules rules;

  GameService(PenteRules rules) {
    this.rules = rules;
  }

  GameResponse createGame() {
    GameState game = new GameState(UUID.randomUUID());
    games.put(game.id, game);
    return GameResponse.from(game);
  }

  GameResponse getGame(UUID id) {
    GameState game = getExistingGame(id);

    synchronized (game) {
      return GameResponse.from(game);
    }
  }

  GameResponse makeMove(UUID id, MoveRequest move) {
    GameState game = getExistingGame(id);

    synchronized (game) {
      rules.makeMove(game, move.row(), move.col());
      return GameResponse.from(game);
    }
  }

  GameResponse restartGame(UUID id) {
    GameState game = getExistingGame(id);

    synchronized (game) {
      game.reset();
      return GameResponse.from(game);
    }
  }

  private GameState getExistingGame(UUID id) {
    GameState game = games.get(id);

    if (game == null) {
      throw new GameNotFoundException(id.toString());
    }

    return game;
  }
}
