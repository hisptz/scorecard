import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'angular-tree-component';
import { ColorPickerModule } from 'ngx-color-picker';
import { DndModule } from 'ng2-dnd';
import { NgxPaginationModule } from 'ngx-pagination';
import { TourNgBootstrapModule } from 'ngx-tour-ng-bootstrap';
import { ContextMenuModule } from 'ngx-contextmenu';
import { FilterByNamePipe } from './pipes/filter-by-name.pipe';
import { FilterLevelPipe } from './pipes/filter-level.pipe';
import { FilterIndicatorByNamePipe } from './pipes/filter-indicator-by-name.pipe';
import { OrderPipe } from './pipes/order-by.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import {ClickOutsideDirective} from './directives/click-outside.directive';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule,
    DndModule.forRoot(),
    NgxPaginationModule,
    FormsModule,
    TranslateModule,
    TourNgBootstrapModule.forRoot(),
    ContextMenuModule.forRoot({
      useBootstrap4: true,
      autoFocus: true,
    })
  ],
  declarations: [
    ClickOutsideDirective,
    FilterByNamePipe,
    FilterLevelPipe,
    FilterIndicatorByNamePipe,
    OrderPipe,
    SafeHtmlPipe
    // OptionsComponent,
    // OrgUnitFilterComponent,
    // PeriodFilterComponent,
    // SharingComponent,
    // MultiselectComponent
  ],
  exports: [
    RouterModule,
    TreeModule,
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    ColorPickerModule,
    TourNgBootstrapModule,
    ContextMenuModule,
    TranslateModule,
    FilterByNamePipe,
    SafeHtmlPipe,
    DndModule,
    FilterLevelPipe,
    OrderPipe,
    FilterIndicatorByNamePipe,
    // OptionsComponent,
    // OrgUnitFilterComponent,
    // PeriodFilterComponent,
    // SharingComponent,
    // MultiselectComponent
  ]
})
export class SharedModule { }
