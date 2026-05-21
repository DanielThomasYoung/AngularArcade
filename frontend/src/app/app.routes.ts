import { Routes } from '@angular/router';
import { Pente } from './pente/pente';

export const routes: Routes = [
  { path: '', component: Pente },
  { path: 'games/:gameId', component: Pente },
  { path: '**', redirectTo: '' },
];
