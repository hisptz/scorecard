import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { ColorPickerModule } from 'ngx-color-picker';
import { DndModule } from 'ng2-dnd';
import {ClickOutsideDirective} from './directives/click-outside.directive';
import {FilterByNamePipe} from './pipes/filter-by-name.pipe';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule,
    DndModule.forRoot()
  ],
  declarations: [
    ClickOutsideDirective,
    FilterByNamePipe,
    SafeHtmlPipe
  ],
  exports: [

  ]
})
export class SharedModule { }
