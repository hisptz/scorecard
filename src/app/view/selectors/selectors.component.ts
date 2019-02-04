import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ApplicationState} from '../../store/reducers';
import {Store} from '@ngrx/store';
import {Observable} from 'rxjs/Observable';
import * as viewSelectors from '../../store/selectors/view.selectors';
import * as viewActions from '../../store/actions/view.actions';
import {Go} from '../../store/actions/router.action';
import * as orgunitSelector from '../../store/selectors/orgunits.selectors';

@Component({
  selector: 'app-selectors',
  templateUrl: './selectors.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./selectors.component.css']
})
export class SelectorsComponent implements OnInit {

  @Input() sorting_column: string = 'none';
  orgunit_settings$: Observable<any>;
  selected_periods$: Observable<any>;
  period_type$: Observable<any>;
  can_edit$: Observable<boolean>;
  orgunit_loading$: Observable<boolean>;
  scorecardid: string;
  options$: Observable<any>;

  printHovered = false;
  excelHovered = false;
  refreshHovered = false;
  editHovered = false;

  @Output() onOrgunitChange = new EventEmitter();
  @Output() onDownloadCsv = new EventEmitter();
  @Output() onUpdate = new EventEmitter();
  constructor(
    private store: Store<ApplicationState>
  ) {
    this.orgunit_settings$ = store.select(viewSelectors.getOrgUnitSettings);
    this.selected_periods$ = store.select(viewSelectors.getSelectedPeriod);
    this.period_type$ = store.select(viewSelectors.getPeriodType);
    this.can_edit$ = store.select(viewSelectors.getCanEdit);
    this.options$ = store.select(viewSelectors.getOptions);
    this.orgunit_loading$ = store.select(orgunitSelector.getOrgunitLoading);
    store.select(viewSelectors.getScorecardId).subscribe((id) => this.scorecardid = id);

  }

  ngOnInit() {
  }

  changeOrgUnit(event) {
    this.onOrgunitChange.emit(event);
    const items = event.items.map((item) => {
      return {
        id: item.id, name: item.name
      };
    });
    if (event.value) {
      const selected_ou = {
        value: event.value,
        starting_name: event.starting_name,
        orgunit_model: event.orgunit_model,
        items
      };
      this.store.dispatch(new viewActions.SetSelectedOu(selected_ou));
    }
  }

  updateOrgUnit(event) {
    this.onOrgunitChange.emit(event);
    const items = event.items.map((item) => {
      return {
        id: item.id, name: item.name
      };
    });
    if (event.value) {
      const selected_ou = {
        value: event.value,
        starting_name: event.starting_name,
        orgunit_model: event.orgunit_model,
        items
      };
      this.store.dispatch(new viewActions.SetSelectedOu(selected_ou));
    }
    this.onUpdate.emit();
  }
  updatePeriod(event) {
    this.store.dispatch(new viewActions.SetSelectedPe(event));
    this.onUpdate.emit();
  }
  changePeriod(event) {
    this.store.dispatch(new viewActions.SetSelectedPe(event));
  }

  optionUpdated(event) {
    this.store.dispatch(new viewActions.SetOptions(event));
  }

  loadScoreCard() {
    this.onUpdate.emit();
  }

  downloadXls() {
    this.onDownloadCsv.emit();
  }

  // invoke a default browser print function
  browserPrint() {
    window.print();
  }

  openScorecardForEditing() {
    this.store.dispatch(new Go({
      path: ['edit', this.scorecardid],
    }));
  }
}
