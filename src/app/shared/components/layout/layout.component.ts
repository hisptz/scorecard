import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {INITIAL_LAYOUT_MODEL} from './layout-model';
import {DragulaService} from 'ng2-dragula';

export interface Header {
  name: string;
  column: string;
  type?: string;
  hidden?: boolean;
  meta?: boolean;
}

export interface Configuration {
  multiple: boolean;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  @Input() layoutModel = INITIAL_LAYOUT_MODEL;
  @Input() visualizationType: string;
  @Output() onLayoutUpdate = new EventEmitter();
  @Output() onLayoutClose: EventEmitter<boolean> = new EventEmitter<boolean>();
  filters: any;
  columns: any;
  rows: any;
  icons: any;
  dimensions: any;
  columnName: string;
  rowName: string;

  showLayout: boolean = true;
  constructor(private dragulaService: DragulaService) {
    this.icons = {
      dx: 'assets/img/data.png',
      ou: 'assets/img/tree.png',
      pe: 'assets/img/period.png'
    };

    this.dimensions = {
      filterDimension: [],
      columnDimension: [],
      rowDimension: []
    };
    if (this.visualizationType === 'CHART') {
      this.rowName = 'Categories dimensions';
      this.columnName = 'Series dimensions';
    }else {
      this.columnName = 'Column dimensions';
      this.rowName = 'Row dimensions';
    }
  }

  ngOnInit() {
    this.updateLayoutDimensions();
    if (this.visualizationType === 'CHART') {
      this.rowName = 'Categories dimensions';
      this.columnName = 'Series dimensions';
    }
  }

  displayLayout() {
    this.showLayout = !this.showLayout;
  }

  onDrop(event, dimension) {
    this.layoutModel[event.dragData.dimension].splice(this.layoutModel[event.dragData.dimension].indexOf(event.dragData.data), 1);
    this.layoutModel[dimension].push(event.dragData.data);
  }

  updateLayoutDimensions() {
    this.filters = this.layoutModel.filters;
    this.columns = this.layoutModel.columns;
    this.rows = this.layoutModel.rows;
  }

  updateLayout() {
    this.onLayoutUpdate.emit(this.layoutModel);
    this.showLayout = true;
  }

  close() {
    this.onLayoutClose.emit(true);
  }
}
