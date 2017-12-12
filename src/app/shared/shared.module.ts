import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {FilterByNamePipe} from './pipes/filter-by-name.pipe';
import {FilterLevelPipe} from './pipes/filter-level.pipe';
import {FilterIndicatorByNamePipe} from './pipes/filter-indicator-by-name.pipe';
import {OrderPipe} from './pipes/order-by.pipe';
import {SafeHtmlPipe} from './pipes/safe-html.pipe';
import {TreeModule} from 'angular-tree-component';
import {ColorPickerModule} from 'ngx-color-picker';
import {DndModule} from 'ng2-dnd';
import {NgxPaginationModule} from 'ngx-pagination';
import {FormsModule} from '@angular/forms';
import {TourNgBootstrapModule} from 'ngx-tour-ng-bootstrap';
import {ContextMenuModule} from 'ngx-contextmenu';

@NgModule({
  imports: [
    CommonModule,
    TreeModule,
    ColorPickerModule,
    DndModule.forRoot(),
    NgxPaginationModule,
    FormsModule,
    TourNgBootstrapModule.forRoot(),
    ContextMenuModule.forRoot({
      useBootstrap4: true,
      autoFocus: true,
    })
  ],
  declarations: [
    FilterByNamePipe,
    FilterLevelPipe,
    FilterIndicatorByNamePipe,
    OrderPipe,
    SafeHtmlPipe,
  ],
  exports: [
    RouterModule
  ]
})
export class SharedModule { }
