package com.example.pente;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
class HealthController {

  @GetMapping("/health")
  HealthResponse health() {
    return new HealthResponse("ok", "pente");
  }

  record HealthResponse(String status, String application) {}
}
