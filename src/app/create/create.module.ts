import { NgModule } from '@angular/core';
import { CreateComponent } from './create.component';
import {SharedModule} from '../shared/shared.module';
import {create_routing} from './create.routing';
import { CKEditorModule } from 'ng2-ckeditor';

@NgModule({
  imports: [
    SharedModule,
    create_routing,
    CKEditorModule
  ],
  declarations: [CreateComponent]
})
export class CreateModule { }
