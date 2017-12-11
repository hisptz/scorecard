/**
 * Created by kelvin on 11/23/16.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {CreateComponent} from "./create/create.component";
import {ViewComponent} from "./view/view.component";

const routes: Routes = [
  { path: '', component: HomeComponent , pathMatch: 'full' },
  { path: 'create/:type/:scorecardid', component: CreateComponent },
  { path: 'view/:scorecardid', component: ViewComponent },
  { path: '**', redirectTo: 'HomeComponent' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class ScoreCardRoutingModule { }
