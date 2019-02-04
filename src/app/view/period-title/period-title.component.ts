import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-period-title',
  templateUrl: './period-title.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./period-title.component.css']
})
export class PeriodTitleComponent implements OnInit {

  @Input() indicator: any = null;
  @Input() indicator_loading: any[] = [];
  @Input() indicator_done_loading: any[] = [];
  @Input() periods_list: any[] = [];
  @Input() has_error: any[] = [];
  @Input() error_text: any[] = [];
  @Input() current_sorting: boolean;
  @Input() sorting_column: string;
  @Input() old_proccessed_percent: number;
  @Input() sorting_period: number;
  @Input() period: any;
  constructor() { }

  ngOnInit() {
  }

}
