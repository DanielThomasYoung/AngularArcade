import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { Pente } from './pente';
import { GameState, PenteApi } from './pente-api';

describe('Pente', () => {
  let component: Pente;
  let fixture: ComponentFixture<Pente>;
  let api: {
    createGame: ReturnType<typeof vi.fn>;
    getGame: ReturnType<typeof vi.fn>;
    makeMove: ReturnType<typeof vi.fn>;
    restartGame: ReturnType<typeof vi.fn>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = {
      createGame: vi.fn(() => of(createGameState())),
      getGame: vi.fn((id: string) => of(createGameState({ id }))),
      makeMove: vi.fn(() =>
        of(
          createGameState({
            board: boardWithStone(18, 18, 1),
            currentPlayer: 2,
          }),
        ),
      ),
      restartGame: vi.fn(() => of(createGameState())),
    };
    router = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Pente],
      providers: [
        { provide: PenteApi, useValue: api },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: routeWithGameId(null) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Pente);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create a backend game on load', () => {
    expect(api.createGame).toHaveBeenCalledOnce();
    expect(component.gameId()).toBe('game-1');
    expect(component.board()).toHaveLength(19);
    expect(router.navigate).toHaveBeenCalledWith(['/games', 'game-1'], { replaceUrl: true });
  });

  it('should post a move to the backend and apply the response', () => {
    component.makeMove(18, 18);

    expect(api.makeMove).toHaveBeenCalledWith('game-1', 18, 18);
    expect(component.board()[18][18]).toBe(1);
    expect(component.currentPlayer()).toBe(2);
  });

  it('should restart through the backend', () => {
    component.newGame();

    expect(api.restartGame).toHaveBeenCalledWith('game-1');
    expect(component.winner()).toBe(0);
  });

  it('should describe a five-in-a-row win', () => {
    component.winner.set(1);
    component.winReason.set('line');

    expect(component.winSummary()).toBe('Red wins with 5 in a row');
  });

  it('should describe a capture win', () => {
    component.winner.set(2);
    component.winReason.set('captures');

    expect(component.winSummary()).toBe('Blue wins with 5 captures');
  });
});

function routeWithGameId(gameId: string | null) {
  return {
    snapshot: {
      paramMap: convertToParamMap(gameId ? { gameId } : {}),
    },
  };
}

function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    id: 'game-1',
    board: createBoard(),
    currentPlayer: 1,
    redCaptures: 0,
    blueCaptures: 0,
    winner: 0,
    winReason: null,
    ...overrides,
  };
}

function createBoard() {
  return Array.from({ length: 19 }, () => Array.from({ length: 19 }, () => 0));
}

function boardWithStone(row: number, col: number, player: number) {
  const board = createBoard();
  board[row][col] = player;
  return board;
}
