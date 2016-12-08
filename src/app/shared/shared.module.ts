import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DhisOrgUnitTreeComponent } from "./dhis-org-unit-tree.component";
import { TreeModule } from 'angular2-tree-component';
import {Ng2PaginationModule} from 'ng2-pagination';
// import {FilterPipe} from "./filter.pipe";

@NgModule({
  imports: [
    CommonModule,
    TreeModule
  ],
  declarations: [ DhisOrgUnitTreeComponent ],
  exports: [ DhisOrgUnitTreeComponent, TreeModule, FormsModule, CommonModule, Ng2PaginationModule ]
})
export class SharedModule { }
