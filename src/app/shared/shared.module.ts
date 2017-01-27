import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeModule } from 'angular2-tree-component';
import {Ng2PaginationModule} from 'ng2-pagination';
import {ColorPickerModule} from "angular2-color-picker";
import { FilterByNamePipe } from './filter-by-name.pipe';
import {TinymceEditorDirective} from "./text-editor/tinymice-editor-directive.directive";
import { SafeHtmlPipe } from './safe-html.pipe';
// import {FilterPipe} from "./filter.pipe";

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule

  ],
  declarations: [ FilterByNamePipe, TinymceEditorDirective, SafeHtmlPipe ],
  exports: [
    TreeModule,
    FormsModule,
    CommonModule,
    Ng2PaginationModule,
    ColorPickerModule,
    FilterByNamePipe,
    TinymceEditorDirective,
    SafeHtmlPipe
  ]
})
export class SharedModule { }
