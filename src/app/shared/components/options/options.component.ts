import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css'],
  animations: [
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
