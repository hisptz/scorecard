import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-loading-notification',
  templateUrl: './loading-notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./loading-notification.component.css'],
  animations: [
    trigger('hiddenItem', [
      state('notHidden' , style({
        'transform': 'scale(1, 1)'
      })),
      state('hidden', style({
        'transform': 'scale(0.0, 0.00)',
        'visibility': 'hidden',
        'height': '0px'
      })),
      transition('notHidden <=> hidden', animate('500ms'))
    ])
  ]
})
export class LoadingNotificationComponent implements OnInit {

  @Input() loading: boolean = false;
  @Input() loading_message: string = '';
  @Input() proccessed_percent: number = 0;
  @Input() proccesed_indicators: number = 0;
  @Input() allIndicatorsLength: number = 0;

  constructor() { }

  ngOnInit() {
  }

}
