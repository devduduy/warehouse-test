import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ItemsComponent } from './pages/items/items';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'items',
    component: ItemsComponent,
    canActivate: [authGuard],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
