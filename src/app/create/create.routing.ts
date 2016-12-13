/**
 * Created by kelvin on 11/23/16.
 */
import { ModuleWithProviders }  from '@angular/core';
import { RouterModule } from '@angular/router';
import { CreateComponent } from "./create.component";
import {UpdateComponent} from "./update.component";

export const create_routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: CreateComponent},
  { path: 'edit/:scorecardid', component: UpdateComponent}
]);
