package com.example.pente;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
class SpaController {

  @GetMapping({"/", "/games/{gameId}"})
  String index() {
    return "forward:/index.html";
  }
}
