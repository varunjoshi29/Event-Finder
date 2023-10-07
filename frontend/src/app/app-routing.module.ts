import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CombiningContainerComponent } from './combining-container/combining-container.component';
import { FavoritesComponent } from './favorites/favorites.component';

const routes: Routes = [
  { path: 'search', component: CombiningContainerComponent },
  { path: 'favorites', component: FavoritesComponent },
  { path: '', redirectTo: '/search', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
