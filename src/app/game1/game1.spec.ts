import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Game1 } from './game1';

describe('Game1', () => {
  let component: Game1;
  let fixture: ComponentFixture<Game1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Game1],
    }).compileComponents();

    fixture = TestBed.createComponent(Game1);
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
});
