import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuardGuard } from './auth/auth-guard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'places', pathMatch: 'full' },
  { path: 'auth', loadChildren: './auth/auth.module#AuthPageModule' },
  {
    path: 'places',
    loadChildren: './pages/places/places.module#PlacesPageModule',
    canLoad: [AuthGuardGuard],
    canActivate: [AuthGuardGuard]
  },
  {
    path: 'bookings',
    loadChildren: './pages/bookings/bookings.module#BookingsPageModule',
    canLoad: [AuthGuardGuard]
  },

];

@NgModule({
  imports: [
  RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
