import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ScoreCard} from '../../shared/models/scorecard';

@Component({
  selector: 'app-create-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.css']
})
export class CreateHeaderComponent implements OnInit {

  @Input() name: string;
  @Input() options: any;
  @Output() onGoHomePage = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter();
  constructor() { }

  ngOnInit() {
  }

  goToHomePage() {
    this.onGoHomePage.emit();
  }

  save() {
    this.onSave.emit();
  }

  cancel() {
    this.onCancel.emit();
  }

  optionUpdated(event) {

  }

}
