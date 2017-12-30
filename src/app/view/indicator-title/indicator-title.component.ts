import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ContextMenuComponent, ContextMenuService} from 'ngx-contextmenu';

@Component({
  selector: 'app-indicator-title',
  templateUrl: './indicator-title.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./indicator-title.component.css']
})
export class IndicatorTitleComponent implements OnInit {

  @Input() indicator: any = null;
  @Input() indicator_loading: any[] = [];
  @Input() indicator_done_loading: any[] = [];
  @Input() periods_list: any[] = [];
  @Input() has_error: any[] = [];
  @Input() error_text: any[] = [];
  @Input() current_sorting: boolean;
  @Input() sorting_column: string;
  @Input() old_proccessed_percent: number;

  // Event emmiter to use once the context menu is clicked
  @Output() sortItem = new EventEmitter<any>();
  @Output() hideItem = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }



}
