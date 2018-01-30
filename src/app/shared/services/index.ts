import {HttpClientService} from './http-client.service';
import {VisualizerService} from './visualizer.service';
import {ScorecardService} from './scorecard.service';
import {DataService} from './data.service';
import {FunctionService} from './function.service';
import {OrgUnitService} from './org-unit.service';
import {DataElementGroupService} from './data-element-group.service';
import {EventDataService} from './event-data.service';
import {DatasetService} from './dataset.service';
import {IndicatorGroupService} from './indicator-group.service';
import {ProgramIndicatorsService} from './program-indicators.service';

export const services: any[] = [
  HttpClientService,
  VisualizerService,
  ScorecardService,
  DataService,
  FunctionService,
  OrgUnitService,
  DataElementGroupService,
  EventDataService,
  DatasetService,
  IndicatorGroupService,
  ProgramIndicatorsService
];
