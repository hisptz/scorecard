import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { ColorPickerModule } from 'ngx-color-picker';
import { DndModule } from 'ng2-dnd';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { FilterByNamePipe } from './pipes/filter-by-name.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { NgxPaginationModule } from 'ngx-pagination';
import {FilterLevelPipe} from './pipes/filter-level.pipe';
import {OrderPipe} from './pipes/order-by.pipe';
import {OrgUnitFilterComponent} from './components/org-unit-filter/org-unit-filter.component';
import {MultiselectComponent} from './components/org-unit-filter/multiselect/multiselect.component';
import {PeriodFilterComponent} from './components/period-filter/period-filter.component';
import { SharingComponent } from './components/sharing/sharing.component';
import { OptionsComponent } from './components/options/options.component';

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule,
    DndModule.forRoot(),
    NgxPaginationModule,
    FormsModule
  ],
  declarations: [
    ClickOutsideDirective,
    FilterByNamePipe,
    SafeHtmlPipe,
    FilterLevelPipe,
    OrderPipe,
    OrgUnitFilterComponent,
    PeriodFilterComponent,
    MultiselectComponent,
    SharingComponent,
    OptionsComponent
  ],
  exports: [
    TreeModule,
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    ColorPickerModule,
    FilterByNamePipe,
    SafeHtmlPipe,
    DndModule,
    ClickOutsideDirective,
    FilterLevelPipe,
    OrderPipe,
    OrgUnitFilterComponent,
    PeriodFilterComponent,
    MultiselectComponent,
    SharingComponent,
    OptionsComponent
  ]
})
export class SharedModule { }
