import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  games = [
    { id: 1, name: 'Game 1' },
    { id: 2, name: 'Game 2' },
    { id: 3, name: 'Game 3' },
    { id: 4, name: 'Game 4' },
    { id: 5, name: 'Game 5' },
    { id: 6, name: 'Game 6' },
    { id: 7, name: 'Game 7' },
    { id: 8, name: 'Game 8' },
    { id: 9, name: 'Game 9' },
    { id: 10, name: 'Game 10' },
    { id: 11, name: 'Game 11' },
    { id: 12, name: 'Game 12' },
    { id: 13, name: 'Game 13' },
    { id: 14, name: 'Game 14' },
    { id: 15, name: 'Game 15' },
    { id: 16, name: 'Game 16' },
  ];

  selectGame(game: { id: number; name: string }) {
    console.log('Selected:', game.name);
    // Later you'll navigate to the game here
  }
}
