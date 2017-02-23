import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'angular2-tree-component';
import { Ng2PaginationModule } from 'ng2-pagination';
import { FilterByNamePipe } from './filter-by-name.pipe';
import { TinymceEditorDirective } from "./text-editor/tinymice-editor-directive.directive";
import { SafeHtmlPipe } from './safe-html.pipe';
import { ColorPickerModule } from "ngx-color-picker";
import { FilterIndicatorByNamePipe } from './filter-indicator-by-name.pipe';
import {DndModule} from "ng2-dnd";
// import {FilterPipe} from "./filter.pipe";

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule,
    DndModule.forRoot()

  ],
  declarations: [ FilterByNamePipe, TinymceEditorDirective, SafeHtmlPipe, FilterIndicatorByNamePipe],
  exports: [
    TreeModule,
    FormsModule,
    CommonModule,
    Ng2PaginationModule,
    ColorPickerModule,
    FilterByNamePipe,
    TinymceEditorDirective,
    FilterIndicatorByNamePipe,
    SafeHtmlPipe,
    DndModule
  ]
})
export class SharedModule { }
