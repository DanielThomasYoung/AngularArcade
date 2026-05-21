package com.example.pente.game;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = {"http://localhost:4200", "http://127.0.0.1:4200", "https://angulararcade.onrender.com"}
)
class GameController {
  private final GameService gameService;

  GameController(GameService gameService) {
    this.gameService = gameService;
  }

  @PostMapping
  GameResponse createGame() {
    return gameService.createGame();
  }

  @GetMapping("/{id}")
  GameResponse getGame(@PathVariable String id) {
    return gameService.getGame(id);
  }

  @PostMapping("/{id}/moves")
  GameResponse makeMove(@PathVariable String id, @RequestBody MoveRequest move) {
    return gameService.makeMove(id, move);
  }

  @PostMapping("/{id}/restart")
  GameResponse restartGame(@PathVariable String id) {
    return gameService.restartGame(id);
  }
}
