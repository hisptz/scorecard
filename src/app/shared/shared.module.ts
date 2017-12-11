import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FilterByNamePipe} from "./pipes/filter-by-name.pipe";
import {FilterLevelPipe} from "./pipes/filter-level.pipe";
import {FilterIndicatorByNamePipe} from "./pipes/filter-indicator-by-name.pipe";
import {OrderPipe} from "./pipes/order-by.pipe";
import {SafeHtmlPipe} from "./pipes/safe-html.pipe";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FilterByNamePipe,
    FilterLevelPipe,
    FilterIndicatorByNamePipe,
    OrderPipe,
    SafeHtmlPipe
  ]
})
export class SharedModule { }
