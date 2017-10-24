import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-indicator-title',
  templateUrl: './indicator-title.component.html',
  styleUrls: ['./indicator-title.component.css']
})
export class IndicatorTitleComponent implements OnInit {

  @Input() indicator: any = null;
  @Input() indicator_loading: any[] = [];
  @Input() indicator_done_loading: any[] = [];
  @Input() periods_list: any[] = [];
  @Input() has_error: any[] = [];
  @Input() current_sorting: boolean;
  @Input() sorting_column: string;
  @Input() old_proccessed_percent: number;
  constructor() { }

  ngOnInit() {
  }


}
