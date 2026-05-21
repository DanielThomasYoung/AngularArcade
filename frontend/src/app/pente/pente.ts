import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { GameState, PenteApi, WinReason } from './pente-api';

const BOARD_SIZE = 19;

@Component({
  selector: 'app-pente',
  imports: [],
  templateUrl: './pente.html',
  styleUrl: './pente.css',
})
export class Pente implements OnInit, OnDestroy {
  private readonly api = inject(PenteApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private pollingSubscription?: Subscription;

  gameId = signal<string | null>(null);
  board = signal<number[][]>(this.createEmptyBoard());
  currentPlayer = signal(1);
  redCaptures = signal(0);
  blueCaptures = signal(0);
  winner = signal(0);
  winReason = signal<WinReason>(null);

  ngOnInit() {
    const gameId = this.route.snapshot.paramMap.get('gameId');

    if (gameId) {
      this.loadGame(gameId);
      return;
    }

    this.createGame();
  }

  ngOnDestroy() {
    this.pollingSubscription?.unsubscribe();
  }

  makeMove(rowIndex: number, colIndex: number) {
    const gameId = this.gameId();

    if (!gameId || this.board()[rowIndex][colIndex] || this.winner()) {
      return;
    }

    this.api.makeMove(gameId, rowIndex, colIndex).subscribe({
      next: (game) => this.applyGame(game),
      error: (error) => console.error('Move failed', error),
    });
  }

  newGame() {
    const gameId = this.gameId();

    if (!gameId) {
      this.createGame();
      return;
    }

    this.api.restartGame(gameId).subscribe({
      next: (game) => this.applyGame(game),
      error: (error) => console.error('Restart failed', error),
    });
  }

  winnerName() {
    return this.winner() === 1 ? 'Red' : 'Blue';
  }

  winSummary() {
    if (this.winReason() === 'line') {
      return `${this.winnerName()} wins with 5 in a row`;
    }

    if (this.winReason() === 'captures') {
      return `${this.winnerName()} wins with 5 captures`;
    }

    return `${this.winnerName()} wins`;
  }

  private createGame() {
    this.api.createGame().subscribe({
      next: (game) => {
        this.applyGame(game);
        this.router.navigate(['/games', game.id], { replaceUrl: true });
        this.startPolling();
      },
      error: (error) => console.error('Create game failed', error),
    });
  }

  private loadGame(gameId: string) {
    this.api.getGame(gameId).subscribe({
      next: (game) => {
        this.applyGame(game);
        this.startPolling();
      },
      error: (error) => {
        console.error('Load game failed', error);
        this.createGame();
      },
    });
  }

  private startPolling() {
    this.pollingSubscription?.unsubscribe();
    this.pollingSubscription = interval(1000).subscribe(() => this.refreshGame());
  }

  private refreshGame() {
    const gameId = this.gameId();

    if (!gameId) {
      return;
    }

    this.api.getGame(gameId).subscribe({
      next: (game) => this.applyGame(game),
      error: (error) => console.error('Refresh game failed', error),
    });
  }

  private applyGame(game: GameState) {
    this.gameId.set(game.id);
    this.board.set(game.board);
    this.currentPlayer.set(game.currentPlayer);
    this.redCaptures.set(game.redCaptures);
    this.blueCaptures.set(game.blueCaptures);
    this.winner.set(game.winner);
    this.winReason.set(game.winReason);
  }

  private createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array.from({ length: BOARD_SIZE }, () => 0));
  }
}
