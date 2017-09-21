import {Component, OnInit, Input, OnDestroy, EventEmitter, Output} from '@angular/core';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {Subscription} from 'rxjs/Subscription';
import {FilterService} from '../../shared/services/filter.service';
import {Angular2Csv} from 'angular2-csv';
import {FunctionService} from '../../shared/services/function.service';
import {DataService} from '../../shared/services/data.service';
import {HttpClientService} from '../../shared/services/http-client.service';
import {VisualizerService} from '../../shared/services/visualizer.service';
import {getSelectedOrgunit} from '../../store/selectors';


@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.css']
})
export class ScorecardComponent implements OnInit, OnDestroy {

  @Input() scorecard: any = null;
  @Input() selectedOrganisationUnit: any = null;
  @Input() selectedPeriod: any = null;

  constructor(
    private dataService: DataService,
    private filterService: FilterService,
    private scorecardService: ScorecardService,
    private functionService: FunctionService,
    private visualizerService: VisualizerService,
    private httpService: HttpClientService
  ) {}

  ngOnInit() {
    this.loadScoreCard();
  }

  // load scorecard after changes has occur
  loadScoreCard() {
    console.log(this.selectedPeriod);
    console.log(this.selectedOrganisationUnit);
    if (this.selectedPeriod && this.selectedOrganisationUnit) {
      this.httpService.get(
        'analytics.json?dimension=pe:' + this.selectedPeriod.value + '&filter=ou:' + this.selectedOrganisationUnit.value + '&displayProperty=NAME&skipData=true'
      ).subscribe(
        (data) => {
          console.log(data);
        }
      );
    }else {
      console.log('scorecard not loaded');
    }
    console.log('scorecard loaded');
  }

  initiateScorecard( period, orgunit ) {
    this.selectedPeriod = period;
    this.selectedOrganisationUnit = orgunit;
    this.loadScoreCard();
  }

  downloadCSV() {
    console.log('scorecard downloaded');
  }

  // Use this for all clean ups
  ngOnDestroy () {

  }


}
