/**
 * Created by kelvin on 11/23/16.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './home/home.component';
import {UserExistsGuards} from './guards/user.exists';
// import { CreateComponent } from './create/create.component';
// import { ViewComponent } from './view/view.component';
// import {ScorecardExistsGuards} from './guards';
// import {UserExistsGuards} from './guards/user.exists';
// import {DocumentationComponent} from "./documentation/documentation.component";

const routes: Routes = [
  {
    path: '',
    canActivate: [UserExistsGuards],
    component: HomeComponent ,
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'HomeComponent' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
  providers: []
})
export class ScoreCardRoutingModule { }
