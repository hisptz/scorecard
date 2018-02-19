import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {animate, group, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./options.component.css'],
  animations: [
  trigger('fadeOut', [
    state('void', style({opacity: 0})),
    transition(':enter', animate('200ms')),
    transition(':leave', animate('200ms'))
  ]),
  trigger('showOption', [
    state('hidden', style(
      {'opacity': 0.1, 'transform': 'translateY(0px)', 'max-height': '50px', 'display': 'none'}
    )),
    state('shown', style(
      {opacity: 1, transform: 'translateY(0)'}
    )),
    transition('hidden => shown', [
      group([
        animate('150ms', style({transform: 'translateY(0)'})),
        animate('200ms', style({opacity: 1})),
        animate('150ms', style({'max-height': '360px'}))
      ])
    ]),
    transition('shown => hidden', [
      group([
        animate('50ms', style({transform: 'translateY(0)', opacity: 1})),
        animate('200ms', style({'display': 'none'})),
        animate('50ms', style({'max-height': '30px'}))
      ])
    ])
  ]),
  trigger('selected', [
    state('not' , style({
      'transform': 'scale(1, 1)',
      'border': '0px'
    })),
    state('active', style({
      'background-color': 'rgba(158, 166, 174, 0.0)',
      '-webkit-box-shadow': '0px 1px 1px rgba(0, 0, 0, .075)',
      'box-shadow': '0px 1px 1px rgba(0, 0, 0, .075)',
      'border': '0px'
    })),
    transition('active <=> not', animate('500ms'))
  ])

]
})
export class OptionsComponent implements OnInit {

  @Input() options: any = null;
  @Input() mode = 'edit';
  @Input() sorting_column = 'none';
  @Output() onOptionUpdate: EventEmitter<any> = new EventEmitter<any>();

  showAdditionalOptions: boolean = true;
  constructor() { }

  ngOnInit() {

  }

  showOptions() {
    this.showAdditionalOptions = !this.showAdditionalOptions;
  }

  updateOption(event) {
    this.onOptionUpdate.emit(this.options);
    event.stopPropagation();
  }

  setOptionFromButton( option, type, value = null ) {
    if (type === 'boolean') {
      this.options[option] = !this.options[option];
    }else {
      this.options[option] = value;
    }
    this.onOptionUpdate.emit(this.options);
  }

}
