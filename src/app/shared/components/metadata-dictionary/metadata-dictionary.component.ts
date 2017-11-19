import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {HttpClientService} from '../../services/http-client.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  moduleId: module.id,
  selector: 'app-metadata-dictionary',
  templateUrl: './metadata-dictionary.component.html',
  styleUrls: ['./metadata-dictionary.component.css']
})
export class MetadataDictionaryComponent implements OnInit {
  public indicators = [];
  public dataelements = [];
  public datasets = [];
  public events = [];
  public programInd = [];
  public isIndicator = false;
  public isDataelements = false;
  public isDataset = false;
  public isEvents = false;
  public isProgramInd = false;
  public showingLoading: boolean = false;
  public progressMessage: string = 'Preparing metadata dictionary';
  @Input() metadataidentifiers: string;

  constructor(private http: HttpClientService, private httpClient: HttpClient) {
    this.indicators = [];
    this.dataelements = [];
    this.datasets = [];
    this.events = [];
    this.programInd = [];
  }

  ngOnInit() {
    // console.log(this.metadataidentifiers);
    const uid = this.metadataidentifiers;
    console.log(this.metadataFromAnalyticsLink(uid));
    this.displayDetail(uid);

  }

  displayDetail(uid) {
    this.showingLoading = true;
    const self = this.http;
    this.metadataFromAnalyticsLink(uid).forEach(value => {
      self.get('identifiableObjects/' + value + '.json')
        .subscribe((data: any) => {
          const metadataLink = data.href;
          if (metadataLink.indexOf('indicators') >= 1) {
            const indicatorUrl = metadataLink + '.json?fields=:all,displayName,id,name,numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,indicatorType[name],user[name],attributeValues[value,attribute[name]],indicatorGroups[name,indicators~size],legendSet[name,symbolizer,legends~size],dataSets[name]';
            self.get_from_base(indicatorUrl)
              .subscribe((indicatorData: any) => {
                  const indicatorObject = indicatorData;
                  self.get('expressions/description?expression=' + encodeURIComponent(indicatorData.numerator))
                    .subscribe((numExp: any) => {
                        const numerator = numExp.description;
                        self.get('expressions/description?expression=' + encodeURIComponent(indicatorData.denominator))
                          .subscribe((denoExp: any) => {
                            const denominator = denoExp.description;
                            this.indicators.push({
                              object: indicatorObject,
                              name: indicatorObject.name,
                              uid: indicatorObject.id,
                              denominatorDescription: indicatorObject.denominatorDescription,
                              numeratorDescription: indicatorObject.numeratorDescription,
                              numerator: numerator,
                              denominator: denominator,
                              indicatorType: indicatorObject.indicatorType,
                              dataSets: indicatorObject.dataSets,
                              numeratorForm: indicatorObject.numerator,
                              demonitorForm: indicatorObject.denominator
                            });
                          });

                      }
                    );
                  this.progressMessage = 'Organising extracted metadata dictionary';
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Metadata dictionary ready for consumption';
                }
              );
            this.showingLoading = false;
            this.isIndicator = true;
          } else if (metadataLink.indexOf('dataElements') >= 1) {
            const dataelementUrl = metadataLink + '.json?fields=:all,id,name,aggregationType,displayName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],dataSets[:all,!compulsoryDataElementOperands]';
            self.get_from_base(dataelementUrl)
              .subscribe(dataelement => {
                  this.dataelements.push(dataelement);
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Metadata dictionary ready for consumption';
                }
              );
            this.isDataelements = true;
            this.showingLoading = false;
          } else if (metadataLink.indexOf('dataSets') >= 1) {
            const datasetUrl = metadataLink + '.json?fields=:all,user[:all],id,name,periodType,shortName,categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]';
            self.get_from_base(datasetUrl)
              .subscribe(dataset => {
                  this.datasets.push(dataset);
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Metadata dictionary ready for consumption';
                }
              );
            this.isDataset = true;
            this.showingLoading = false;
          } else if (metadataLink.indexOf('programs') >= 1) {
            const eventUrl = metadataLink + '.json?fields=:all,programStages[:all,programStageDataElements[:all]]';
            self.get_from_base(eventUrl)
              .subscribe(event => {
                  this.events.push(event);
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Metadata dictionary ready for consumption';
                }
              );
            this.isEvents = true;
            this.showingLoading = false;
          } else if (metadataLink.indexOf('programIndicators') >= 1) {
            const programUrl = metadataLink + '.json?fields=:all,user[:all],program[:all]';
            self.get_from_base(programUrl)
              .subscribe((progInd: any) => {
                  const headers = new HttpHeaders();
                  headers.append('Content-Type', 'application/json;charset=UTF-8');
                  const url = 'programIndicators/filter/description';
                  const expr = 'programIndicators/expression/description';
                  if (progInd.hasOwnProperty('filter')) {
                    this.httpClient.post(url, progInd.filter, {headers: headers})
                      .subscribe(
                        (progData: any) => {
                          this.httpClient.post(expr, progInd.expression, {headers: headers})
                            .subscribe(
                              (expres: any) => {
                                this.programInd.push({
                                  object: progInd,
                                  filterName: progData.description,
                                  expressionName: expres.description
                                });
                              },
                              error => {
                                this.progressMessage = 'Sorry we are still looking what might be wrong';
                              },
                              () => {
                                this.progressMessage = 'Metadata dictionary ready for consumption';
                              }
                            );

                        }
                      );
                  } else {
                    this.httpClient.post(expr, progInd.expression, {headers: headers})
                      .subscribe(
                        (expres: any) => {
                          this.programInd.push({
                            object: progInd,
                            expressionName: expres.description
                          });
                        },
                        error => {
                          this.progressMessage = 'Sorry we are still looking what might be wrong';
                        },
                        () => {
                          this.progressMessage = 'Metadata dictionary ready for consumption';
                        }
                      );
                  }
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Metadata dictionary ready for consumption';
                }
              );
            this.isProgramInd = true;
            this.showingLoading = false;
          }

        });
    });
  }

  getIndicatorProgramFilterExpression(filterExpression) {

  }

  metadataFromAnalyticsLink(dx) {
    const separatedx = [];
    if (dx.indexOf(';') >= 1) {
      dx.split(';').forEach(data => {
        if (data.indexOf('.') >= 1) {
          if (separatedx.indexOf(data.split('.')[0]) !== -1) {
          } else {
            separatedx.push(data.split('.')[0]);
          }
        } else {
          separatedx.push(data);
        }
      });
    } else {
      if (dx.indexOf('.') >= 1) {
        separatedx.push(dx.split('.')[0]);
      } else {
        separatedx.push(dx);
      }

    }
    return separatedx;

  }

}
