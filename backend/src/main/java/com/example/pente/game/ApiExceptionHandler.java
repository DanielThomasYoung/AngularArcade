package com.example.pente.game;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class ApiExceptionHandler {

  @ExceptionHandler(GameNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  Map<String, String> handleGameNotFound(GameNotFoundException exception) {
    return Map.of("error", exception.getMessage());
  }

  @ExceptionHandler(InvalidMoveException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  Map<String, String> handleInvalidMove(InvalidMoveException exception) {
    return Map.of("error", exception.getMessage());
  }
}
