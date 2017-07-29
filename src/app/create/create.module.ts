import { NgModule } from '@angular/core';
import { CreateComponent } from './create.component';
import {SharedModule} from '../shared/shared.module';
import {create_routing} from './create.routing';

@NgModule({
  imports: [
    SharedModule,
    create_routing
  ],
  declarations: [CreateComponent]
})
export class CreateModule { }
