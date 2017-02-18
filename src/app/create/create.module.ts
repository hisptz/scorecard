import { NgModule } from '@angular/core';
import { CreateComponent } from './create.component';

import { SharedModule } from "../shared/shared.module";
import { create_routing } from "./create.routing";
import { TextEditorComponent } from '../shared/text-editor/text-editor.component';

@NgModule({
  imports: [
    SharedModule,
    create_routing
  ],
  declarations: [CreateComponent, TextEditorComponent]
})
export class CreateModule { }
