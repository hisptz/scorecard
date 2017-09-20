import {Component, OnInit, Input, OnDestroy, EventEmitter, Output} from '@angular/core';
import {ScorecardService} from '../../shared/services/scorecard.service';
import {Subscription} from 'rxjs/Subscription';
import {FilterService} from '../../shared/services/filter.service';
import {Angular2Csv} from 'angular2-csv';
import {FunctionService} from '../../shared/services/function.service';
import {DataService} from '../../shared/services/data.service';
import {HttpClientService} from '../../shared/services/http-client.service';
import {VisualizerService} from '../../shared/services/visualizer.service';


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
    this.httpService.get(
      'analytics.json?dimension=pe:LAST_4_QUARTERS&filter=ou:YtVMnut7Foe;acZHYslyJLt;vU0Qt1A5IDz&displayProperty=NAME&skipData=true'
    ).subscribe(
      (data) => {
        console.log(data);
      }
    )
    console.log('scorecard loaded');
  }

  downloadCSV() {
    console.log('scorecard downloaded');
  }

  // Use this for all clean ups
  ngOnDestroy () {

  }


}
