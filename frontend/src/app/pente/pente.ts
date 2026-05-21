import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { GameState, PenteApi, WinReason } from './pente-api';

const BOARD_SIZE = 19;
const STARTUP_RETRY_MS = 2000;
const SLOW_START_MS = 1200;

type StartupAction = { kind: 'create' } | { kind: 'load'; gameId: string };

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
  private startupRetryTimer?: ReturnType<typeof setTimeout>;
  private slowStartTimer?: ReturnType<typeof setTimeout>;

  gameId = signal<string | null>(null);
  board = signal<number[][]>(this.createEmptyBoard());
  currentPlayer = signal(1);
  redCaptures = signal(0);
  blueCaptures = signal(0);
  winner = signal(0);
  winReason = signal<WinReason>(null);
  isWaitingForBackend = signal(true);
  isBackendWaking = signal(false);
  startupAttempts = signal(0);
  backendWaitTitle = computed(() =>
    this.isBackendWaking() ? 'Waking up the game server' : 'Connecting to the game server',
  );
  backendWaitDetail = computed(() => {
    if (this.startupAttempts() > 1) {
      return 'The hosted backend is starting after idle time. Retrying now.';
    }

    if (this.isBackendWaking()) {
      return 'This can take a few seconds after the service has been idle.';
    }

    return 'Preparing your Pente board.';
  });

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
    this.clearStartupTimers();
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
    this.beginStartupRequest();
    this.api.createGame().subscribe({
      next: (game) => {
        this.finishStartupRequest();
        this.applyGame(game);
        this.router.navigate(['/games', game.id], { replaceUrl: true });
        this.startPolling();
      },
      error: (error) => this.scheduleStartupRetry({ kind: 'create' }, 'Create game failed', error),
    });
  }

  private loadGame(gameId: string) {
    this.beginStartupRequest();
    this.api.getGame(gameId).subscribe({
      next: (game) => {
        this.finishStartupRequest();
        this.applyGame(game);
        this.startPolling();
      },
      error: (error) => {
        console.error('Load game failed', error);
        if (error?.status === 404) {
          this.createGame();
          return;
        }

        this.scheduleStartupRetry({ kind: 'load', gameId }, 'Load game failed', error);
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

  private beginStartupRequest() {
    if (this.gameId()) {
      return;
    }

    this.clearStartupTimers();
    this.isWaitingForBackend.set(true);
    this.startupAttempts.update((attempts) => attempts + 1);

    if (this.startupAttempts() > 1) {
      this.isBackendWaking.set(true);
      return;
    }

    this.slowStartTimer = setTimeout(() => this.isBackendWaking.set(true), SLOW_START_MS);
  }

  private finishStartupRequest() {
    this.clearStartupTimers();
    this.isWaitingForBackend.set(false);
    this.isBackendWaking.set(false);
    this.startupAttempts.set(0);
  }

  private scheduleStartupRetry(action: StartupAction, message: string, error: unknown) {
    console.error(message, error);
    this.clearStartupTimers();
    this.isWaitingForBackend.set(true);
    this.isBackendWaking.set(true);
    this.startupRetryTimer = setTimeout(() => this.runStartupAction(action), STARTUP_RETRY_MS);
  }

  private runStartupAction(action: StartupAction) {
    if (action.kind === 'create') {
      this.createGame();
      return;
    }

    this.loadGame(action.gameId);
  }

  private clearStartupTimers() {
    if (this.startupRetryTimer) {
      clearTimeout(this.startupRetryTimer);
      this.startupRetryTimer = undefined;
    }

    if (this.slowStartTimer) {
      clearTimeout(this.slowStartTimer);
      this.slowStartTimer = undefined;
    }
  }
}
