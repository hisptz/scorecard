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

  @Input() scorecard: any;
  @Input() mode = 'edit';
  @Output() onOptionUpdate: EventEmitter<any> = new EventEmitter<any>();

  showAdditionalOptions: boolean = true;
  options: any = null;
  constructor() { }

  ngOnInit() {
    this.options = {
      show_legend_definition: this.scorecard.data.header.show_legend_definition,
      show_rank: this.scorecard.data.show_rank,
      empty_rows: this.scorecard.data.empty_rows,
      show_average_in_column: this.scorecard.data.show_average_in_column,
      show_average_in_row: this.scorecard.data.show_average_in_row,
      average_selection: this.scorecard.data.average_selection,
      shown_records: this.scorecard.data.shown_records,
      show_score: this.scorecard.data.show_score,
      show_arrows_definition: this.scorecard.data.header.show_arrows_definition,
      show_data_in_column: this.scorecard.data.show_data_in_column
    };
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
