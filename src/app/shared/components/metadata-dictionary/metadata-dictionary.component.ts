import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {HttpClientService} from '../../services/http-client.service';
import 'rxjs/add/observable/forkJoin';

@Component({
  moduleId: module.id,
  selector: 'app-metadata-dictionary',
  templateUrl: './metadata-dictionary.component.html',
  styleUrls: ['./metadata-dictionary.component.css']
})
export class MetadataDictionaryComponent implements OnInit, OnDestroy {
  indicators = [];
  CompleteData = [];
  dataelements = [];
  dataelementsNumerator = [];
  datasets = [];
  events = [];
  programInd = [];
  isIndicator = false;
  isDataelements = false;
  isDataset = false;
  isEvents = false;
  isProgramInd = false;
  showingLoading = false;
  progressMessage = 'Preparing metadata dictionary';
  @Input() metadataidentifiers: string;
  subscription: Subscription;
  public oneAtATime = true;
  public isFirstOpen = false;

  constructor(private http: HttpClientService) {
    this.indicators = [];
    this.CompleteData = [];
    this.dataelements = [];
    this.datasets = [];
    this.events = [];
    this.programInd = [];
    this.dataelementsNumerator = [];
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
    let count = 0;
    const Completeindicators = [];
    this.metadataFromAnalyticsLink(uid).forEach(value => {
      count++;
      this.subscription = self.get('identifiableObjects/' + value + '.json')
        .subscribe(data => {
          const metadataLink = data.href;
          if (metadataLink.indexOf('indicators') >= 1) {
            const indicatorUrl = metadataLink + '.json?fields=:all,displayName,id,name,' +
              'numeratorDescription,denominatorDescription,denominator,numerator,annualized,decimals,' +
              'indicatorType[name],user[name],attributeValues[value,attribute[name]],indicatorGroups[name,indicators~size],' +
              'legendSet[name,symbolizer,legends~size],dataSets[name]';
            this.subscription = self.get_from_base(indicatorUrl)

              .subscribe( indicatorData => {
                  // console.log(this.dataElementAvailable(data.numerator));
                  const indicatorObject = indicatorData;
                  const numeratorExp = self.get('expressions/description?expression='
                    + encodeURIComponent(indicatorData.numerator));
                  const numeratorDataset = self.get('dataSets.json?fields=periodType,id,name,' +
                    'timelyDays,formType,created,expiryDays&filter=dataSetElements.dataElement.id:in:[' +
                    this.dataElementAvailable(indicatorData.numerator) + ']&paging=false)');
                  const denominatorExp = self.get('expressions/description?expression=' +
                    encodeURIComponent(indicatorData.denominator));
                  const denominatorDataSet = self.get('dataSets.json?fields=periodType,id,name,timelyDays,formType,' +
                    'created,expiryDays&filter=dataSetElements.dataElement.id:in:[' +
                    this.dataElementAvailable(indicatorData.denominator) + ']&paging=false)');
                  this.subscription = Observable.forkJoin([numeratorExp, numeratorDataset, denominatorExp, denominatorDataSet])
                    .subscribe((results: any) => {
                        const numerator = results[0].description;
                        const numeratorDataEl = results[1];
                        const denominator = results[2].description;
                        const denominatorDataEl = results[3];
                        Completeindicators.push({
                          object: indicatorObject,
                          numeratorDaset: numeratorDataEl,
                          denominatorDaset: denominatorDataEl,
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
                        this.CompleteData = Completeindicators;

                      },
                      error => {
                        this.progressMessage = 'Sorry we are still looking what might be wrong';
                      },
                      () => {
                        this.progressMessage = 'Compiling' + data.name + ' for consumptions';
                        if (count === this.metadataFromAnalyticsLink(uid).length) {
                          console.log(count);
                          console.log(this.indicators = this.CompleteData);
                          this.showingLoading = false;
                        }

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

            this.isIndicator = true;

          } else if (metadataLink.indexOf('dataElements') >= 1) {
            let dataelementUrl = metadataLink + '.json?fields=:all,id,name,aggregationType,displayName,';
            dataelementUrl += 'categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]],' +
              'dataSets[:all,!compulsoryDataElementOperands]';
            this.subscription = self.get_from_base(dataelementUrl)
              .subscribe(dataelement => {
                  this.dataelements.push(dataelement);
                  console.log(this.dataelements); // It brings undefined
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Compiling data for consumptions';
                  if (count === this.metadataFromAnalyticsLink(uid).length) {
                    console.log(count);
                    this.showingLoading = false;
                  }
                }
              );
            this.isDataelements = true;

          } else if (metadataLink.indexOf('dataSets') >= 1) {
            const datasetUrl = metadataLink + '.json?fields=:all,user[:all],id,name,periodType,shortName,' +
              'categoryCombo[id,name,categories[id,name,categoryOptions[id,name]]]';
            this.subscription = self.get_from_base(datasetUrl)
              .subscribe(dataset => {
                  this.datasets.push(dataset); // It brings undefined
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Compiling data for consumptions';
                  if (count === this.metadataFromAnalyticsLink(uid).length) {
                    console.log(count);
                    this.showingLoading = false;
                  }
                }
              );
            this.isDataset = true;
          } else if (metadataLink.indexOf('programs') >= 1) {
            const eventUrl = metadataLink + '.json?fields=:all,programStages[:all,programStageDataElements[:all]]';
            this.subscription = self.get_from_base(eventUrl)
              .subscribe(event => {
                  this.events.push(event);
                },
                error => {
                  this.progressMessage = 'Sorry we are still looking what might be wrong';
                },
                () => {
                  this.progressMessage = 'Compiling data for consumptions';
                  if (count === this.metadataFromAnalyticsLink(uid).length) {
                    console.log(count);
                    this.showingLoading = false;
                  }
                }
              );
            this.isEvents = true;
          } else if (metadataLink.indexOf('programIndicators') >= 1) {
            const programUrl = metadataLink + '.json?fields=:all,user[:all],program[:all]';
            this.subscription = self.get_from_base(programUrl)
              .subscribe(progInd => {
                  const headers = new Headers();
                  headers.append('Content-Type', 'application/json;charset=UTF-8');
                  const url = 'programIndicators/filter/description';
                  const expr = 'programIndicators/expression/description';
                  if (progInd.hasOwnProperty('filter')) {
                    this.http.post(url, progInd.filter, {headers: headers})
                      .subscribe(
                        programDatadata => {
                          this.http.post(expr, progInd.expression, {headers: headers})
                            .subscribe(
                              expres => {
                                this.programInd.push({
                                  object: progInd,
                                  filterName: programDatadata.description,
                                  expressionName: expres.description
                                });
                                console.log(this.programInd);
                              },
                              error => {
                                this.progressMessage = 'Sorry we are still looking what might be wrong';
                              },
                              () => {
                                this.progressMessage = 'Compiling data for consumptions';
                                if (count === this.metadataFromAnalyticsLink(uid).length) {
                                  console.log(count);
                                  this.showingLoading = false;
                                }
                              }
                            );
                        }
                      );
                  } else {
                    this.http.post(expr, progInd.expression, {headers: headers})
                      .subscribe(
                        expres => {
                          this.programInd.push({
                            object: progInd,
                            expressionName: expres.description
                          });
                        },
                        error => {
                          this.progressMessage = 'Sorry we are still looking what might be wrong';
                        },
                        () => {
                          this.progressMessage = 'Compiling data for consumptions';
                          if (count === this.metadataFromAnalyticsLink(uid).length) {
                            console.log(count);
                            this.showingLoading = false;
                          }
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
            // this.showingLoading=false
          }

        });
    });


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

  dataElementAvailable(data) {
    let dataelementuid = [];
    const separators = [' ', '\\\+', '-', '\\\(', '\\\)', '\\*', '/', ':', '\\\?'];
    const numeratorDataelemnt = data.split(new RegExp(separators.join('|'), 'g'));
    numeratorDataelemnt.forEach(sinngeDa => {
      dataelementuid = this.dataElementWithCatOptionCheck(sinngeDa);
    });
    return dataelementuid.join();

  }

  dataElementWithCatOptionCheck(dx) {
    const uid = [];
    if (dx.indexOf('.') >= 1) {
      uid.push((dx.replace(/#/g, '').replace(/{/g, '').replace(/}/g, '')).split('.')[0]);
    } else {
      uid.push((dx.replace(/#/g, '').replace(/{/g, '').replace(/}/g, '')));
    }

    return uid;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
