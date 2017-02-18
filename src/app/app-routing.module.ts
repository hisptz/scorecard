/**
 * Created by kelvin on 11/23/16.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule,PreloadAllModules } from '@angular/router';
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  { path: '', component: HomeComponent , pathMatch: 'full' },
  { path: 'create', loadChildren: 'app/create/create.module#CreateModule' },
  { path: 'view', loadChildren: 'app/view/view.module#ViewModule' },
  { path: '**',redirectTo: 'HomeComponent' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class ScoreCardRoutingModule { }
