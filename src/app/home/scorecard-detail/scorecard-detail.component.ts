import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {ScoreCard} from '../../shared/models/scorecard';
import {ApplicationState} from '../../store/reducers';
import {Go} from '../../store/actions/router.action';

@Component({
  selector: 'app-scorecard-detail',
  templateUrl: './scorecard-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./scorecard-detail.component.css']
})
export class ScorecardDetailComponent implements OnInit {

  @Input() scorecard: ScoreCard;
  confirm_deleting = false;
  deleting = false;
  error_deleting = false;
  constructor(private store: Store<ApplicationState>) { }

  ngOnInit() {
  }

  openScorecardForEditing(scorecard, event) {
    this.store.dispatch(new Go({
      path: ['create', 'edit', scorecard.id],
    }));
    event.stopPropagation();
  }

  deleteScoreCard(scorecard, event) {
    this.deleting = true;
    console.log('Deleting this scorecard');
    event.stopPropagation();
  }

  cancelDeleting(event) {
    this.confirm_deleting = false;
    event.stopPropagation();
  }

  enableDeleting(event) {
    this.confirm_deleting = true;
    event.stopPropagation();
  }
}
