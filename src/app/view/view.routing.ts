/**
 * Created by kelvin on 11/23/16.
 */
import { ModuleWithProviders }  from '@angular/core';
import { RouterModule } from '@angular/router';
import {ViewComponent} from "./view.component";

export const view_routing: ModuleWithProviders = RouterModule.forChild([
  { path: ':scorecardid', component: ViewComponent},
  { path: 'view/:scorecardid', component: ViewComponent , pathMatch: 'full'}
]);
