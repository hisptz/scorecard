/**
 * Created by kelvin on 11/23/16.
 */
import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CreateComponent } from './create/create.component';
import { ViewComponent } from './view/view.component';
import {ScorecardExistsGuards} from './guards';
import {UserExistsGuards} from './guards/user.exists';
import {DocumentationComponent} from "./documentation/documentation.component";

const routes: Routes = [
  {
    path: '',
    canActivate: [UserExistsGuards],
    component: HomeComponent ,
    pathMatch: 'full'
  },
  {
    path: 'documentation',
    component: DocumentationComponent ,
    pathMatch: 'full'
  },
  {
    path: 'edit/:scorecardid',
    canActivate: [UserExistsGuards, ScorecardExistsGuards],
    component: CreateComponent },
  {
    path: 'create',
    canActivate: [UserExistsGuards],
    component: CreateComponent },
  {
    path: 'view/:scorecardid',
    canActivate: [UserExistsGuards, ScorecardExistsGuards],
    component: ViewComponent },
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
