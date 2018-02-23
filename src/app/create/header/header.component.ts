import {
  ApplicationInitStatus, ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit,
  Output
} from '@angular/core';
import {ScoreCard} from '../../shared/models/scorecard';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {Observable} from 'rxjs/Observable';
import {ApplicationState} from '../../store/reducers';
import {Store} from '@ngrx/store';
import {Go} from '../../store/actions/router.action';
import {LoadScorecardSuccess} from '../../store/actions/scorecard.actions';
import {TranslateService} from '@ngx-translate/core';
import {SET_OPTIONS, SetOptions} from '../../store/actions/create.actions';

@Component({
  selector: 'app-create-header',
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./header.component.css']
})
export class CreateHeaderComponent implements OnInit {

  @Input() scorecard: ScoreCard;
  @Input() name: string;
  @Input() position: string;
  @Input() options: any;
  @Input() action_type: any;
  @Output() onGoHomePage = new EventEmitter();
  @Output() onCancel = new EventEmitter();
  @Output() onSave = new EventEmitter();
  @Output() onStartTour = new EventEmitter();

  saving_scorecard: boolean = false;
  saving_error: boolean = false;
  show_more: boolean = false;
  constructor(
    private store: Store<ApplicationState>,
    private scorecardService: ScorecardService,
    private translate: TranslateService
  ) {

  }

  ngOnInit() {
  }

  goToHomePage() {
    this.onGoHomePage.emit();
  }

  save() {
    if (this.scorecard.data.data_settings.indicator_holders.length === 0 || this.scorecard.data.header.title === '' || this.scorecard.data.header.description === '') {
      this.onSave.emit(true);
      // this.someErrorOccured = true;
      // if (this.scorecard.data.header.description === '') {
      //   this.discription_element.nativeElement.focus();
      // }
      // if (this.scorecard.data.header.title === '') {
      //   this.title_element.nativeElement.focus();
      // }
      setTimeout(() => {
        this.onSave.emit(false);
      }, 5000);

    }else {
      this.scorecardService.cleanUpEmptyColumns(this.scorecard.data.data_settings.indicator_holders, this.scorecard.data.data_settings.indicator_holder_groups, );

      //  add related indicators to another datastore to enable flexible data analysis
      this.scorecard.data.data_settings.indicator_holders.forEach((holder) => {
        holder.indicators.forEach( (indicator) => {
          if ( indicator.bottleneck_indicators.length !== 0 ) {
            this.scorecardService.addRelatedIndicator(indicator.id, indicator.bottleneck_indicators);
          }
        });
      });

      //  post the data
      this.saving_scorecard = true;
      if (this.action_type === 'create') {
        this.scorecardService.create(this.scorecard).subscribe(
          (data) => {
            this.saving_scorecard = false;
            this.scorecardService.addScorecardToStore( this.scorecard.id, this.scorecard.data );
            this.store.dispatch(new Go({  path: ['view', this.scorecard.id] }));
          },
          error => {
            this.saving_error = true;
            this.saving_scorecard = false;
          }
        );
      }else {
        this.scorecardService.update(this.scorecard).subscribe(
          (data) => {
            this.saving_scorecard = false;
            const scorecard_item = {
              id: this.scorecard.id,
              name: this.scorecard.data.header.title,
              description: this.scorecard.data.header.description,
              data: this.scorecard.data,
              can_edit: true
            };
            this.store.dispatch(new LoadScorecardSuccess(scorecard_item));
            this.store.dispatch(new Go({  path: ['view', this.scorecard.id] }));
          },
          error => {
            this.saving_error = true;
            this.saving_scorecard = false;
          }
        );
      }
    }

  }

  cancel() {
    this.onCancel.emit();
  }

  startTour() {
    this.onStartTour.emit();
  }

  optionUpdated(event) {
    this.store.dispatch(new SetOptions(event));
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}
