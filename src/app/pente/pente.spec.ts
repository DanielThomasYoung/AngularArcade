import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pente } from './pente';

describe('Pente', () => {
  let component: Pente;
  let fixture: ComponentFixture<Pente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pente],
    }).compileComponents();

    fixture = TestBed.createComponent(Pente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should place a stone at the lower-right edge', () => {
    expect(() => component.makeMove(39, 39)).not.toThrow();

    expect(component.board()[39][39]).toBe(1);
    expect(component.currentPlayer()).toBe(2);
  });

  it('should capture across the top edge', () => {
    component.board.update((board) => {
      const newBoard = board.map((row) => [...row]);
      newBoard[0][1] = 2;
      newBoard[0][2] = 2;
      newBoard[0][3] = 1;
      return newBoard;
    });

    component.makeMove(0, 0);

    expect(component.board()[0][0]).toBe(1);
    expect(component.board()[0][1]).toBe(0);
    expect(component.board()[0][2]).toBe(0);
    expect(component.redCaptures()).toBe(1);
  });

  it('should describe a five-in-a-row win', () => {
    component.board.update((board) => {
      const newBoard = board.map((row) => [...row]);
      newBoard[0][0] = 1;
      newBoard[0][1] = 1;
      newBoard[0][2] = 1;
      newBoard[0][3] = 1;
      return newBoard;
    });

    component.makeMove(0, 4);

    expect(component.winner()).toBe(1);
    expect(component.winReason()).toBe('line');
    expect(component.winSummary()).toBe('Red wins with 5 in a row');
  });

  it('should describe a capture win', () => {
    component.redCaptures.set(4);
    component.board.update((board) => {
      const newBoard = board.map((row) => [...row]);
      newBoard[0][1] = 2;
      newBoard[0][2] = 2;
      newBoard[0][3] = 1;
      return newBoard;
    });

    component.makeMove(0, 0);

    expect(component.winner()).toBe(1);
    expect(component.winReason()).toBe('captures');
    expect(component.winSummary()).toBe('Red wins with 5 captures');
  });
});
