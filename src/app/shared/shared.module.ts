import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { ColorPickerModule } from 'ngx-color-picker';
import { DndModule } from 'ng2-dnd';

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule,
    DndModule.forRoot()
  ],
  declarations: []
})
export class SharedModule { }
