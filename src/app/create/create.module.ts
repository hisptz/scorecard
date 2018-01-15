import { NgModule } from '@angular/core';
import { CreateComponent } from './create.component';
import { SharedModule } from '../shared/shared.module';
import { CKEditorModule } from 'ng2-ckeditor';
import { CreateHeaderComponent } from './header/header.component';
import { DataSelectionComponent } from './data-selection/data-selection.component';
import { SampleScorecardComponent } from './sample-scorecard/sample-scorecard.component';
import { BasicDetailsComponent } from './basic-details/basic-details.component';
import { LegendComponent } from './legend/legend.component';
import { ItemDetailsComponent } from './item-details/item-details.component';
import { BottleneckComponent } from './bottleneck/bottleneck.component';
import { TitleAreaComponent } from './title-area/title-area.component';
import {Ng2HighchartsModule} from 'ng2-highcharts';

@NgModule({
  imports: [
    SharedModule,
    Ng2HighchartsModule,
    CKEditorModule
  ],
  declarations: [
    CreateComponent,
    CreateHeaderComponent,
    DataSelectionComponent,
    SampleScorecardComponent,
    BasicDetailsComponent,
    LegendComponent,
    ItemDetailsComponent,
    BottleneckComponent,
    TitleAreaComponent]
})
export class CreateModule { }
