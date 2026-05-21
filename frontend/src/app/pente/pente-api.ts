import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export type WinReason = 'line' | 'captures' | null;

export interface GameState {
  id: string;
  board: number[][];
  currentPlayer: number;
  redCaptures: number;
  blueCaptures: number;
  winner: number;
  winReason: WinReason;
}

@Injectable({ providedIn: 'root' })
export class PenteApi {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://danpentebackend.onrender.com/api/games';

  createGame() {
    return this.http.post<GameState>(this.apiUrl, {});
  }

  getGame(id: string) {
    return this.http.get<GameState>(`${this.apiUrl}/${id}`);
  }

  makeMove(id: string, row: number, col: number) {
    return this.http.post<GameState>(`${this.apiUrl}/${id}/moves`, { row, col });
  }

  restartGame(id: string) {
    return this.http.post<GameState>(`${this.apiUrl}/${id}/restart`, {});
  }
}
