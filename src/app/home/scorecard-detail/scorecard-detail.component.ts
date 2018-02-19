import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Store} from '@ngrx/store';
import {ScoreCard} from '../../shared/models/scorecard';
import {ApplicationState} from '../../store/reducers';
import {Go} from '../../store/actions/router.action';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {RemoveScorecardsSuccess} from '../../store/actions/scorecard.actions';

@Component({
  selector: 'app-scorecard-detail',
  templateUrl: './scorecard-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./scorecard-detail.component.css']
})
export class ScorecardDetailComponent implements OnInit {

  @Input() scorecard: ScoreCard;
  @Input() viewType: string;
  @Output() onScorecardDelete = new EventEmitter();
  confirm_deleting = false;
  deleting = false;
  error_deleting = false;
  constructor(
    private store: Store<ApplicationState>,
    private scoreCardService: ScorecardService
  ) { }

  ngOnInit() {
  }

  openScorecardForEditing(scorecard, event) {
    this.store.dispatch(new Go({
      path: ['edit', scorecard.id],
    }));
    event.stopPropagation();
  }

  deleteScoreCard(scorecard, event) {
    this.deleting = true;
    this.scoreCardService.remove( scorecard ).subscribe(
      data => {
        this.store.dispatch(new RemoveScorecardsSuccess(scorecard.id));
      },
      error => {
        this.deleting = false;
        this.error_deleting = true;
        setTimeout(function() {
          scorecard.error_deleting = false;
        }, 4000);
      }
    );
    this.onScorecardDelete.emit();
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
