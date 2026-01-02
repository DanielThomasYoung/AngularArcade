import { Routes } from '@angular/router';
import { About } from './about/about';
import { Home } from './home/home';
import { Game1 } from './game1/game1';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'about', component: About },
  { path: 'game1', component: Game1 },
];
