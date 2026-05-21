package com.example.pente.game;

import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import org.springframework.stereotype.Service;

@Service
class GameService {
  private final ConcurrentMap<String, GameState> games = new ConcurrentHashMap<>();
  private final PenteRules rules;

  GameService(PenteRules rules) {
    this.rules = rules;
  }

  GameResponse createGame() {
    GameState game = new GameState(UUID.randomUUID().toString().substring(0, 6));
    games.put(game.id, game);
    return GameResponse.from(game);
  }

  GameResponse getGame(String id) {
    GameState game = getExistingGame(id);

    synchronized (game) {
      return GameResponse.from(game);
    }
  }

  GameResponse makeMove(String id, MoveRequest move) {
    GameState game = getExistingGame(id);

    synchronized (game) {
      rules.makeMove(game, move.row(), move.col());
      return GameResponse.from(game);
    }
  }

  GameResponse restartGame(String id) {
    GameState game = getExistingGame(id);

    synchronized (game) {
      game.reset();
      return GameResponse.from(game);
    }
  }

  private GameState getExistingGame(String id) {
    GameState game = games.get(id);

    if (game == null) {
      throw new GameNotFoundException(id.toString());
    }

    return game;
  }
}
