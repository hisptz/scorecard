import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
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

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule,
    DndModule.forRoot(),
    NgxPaginationModule
  ],
  declarations: [
    ClickOutsideDirective,
    FilterByNamePipe,
    SafeHtmlPipe,
    FilterLevelPipe,
    OrderPipe
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
    OrderPipe
  ]
})
export class SharedModule { }
