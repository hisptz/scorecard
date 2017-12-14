import { NgModule } from '@angular/core';
import { CreateComponent } from './create.component';
import { SharedModule } from '../shared/shared.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { CreateHeaderComponent } from './header/header.component';
import { DataSelectionComponent } from './data-selection/data-selection.component';
import { SampleScorecardComponent } from './sample-scorecard/sample-scorecard.component';

@NgModule({
  imports: [
    SharedModule,
    CKEditorModule
  ],
  declarations: [
    CreateComponent,
    CreateHeaderComponent,
    DataSelectionComponent,
    SampleScorecardComponent]
})
export class CreateModule { }
