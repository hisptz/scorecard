import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SampleScorecardComponent } from './sample-scorecard.component';

describe('SampleScorecardComponent', () => {
  let component: SampleScorecardComponent;
  let fixture: ComponentFixture<SampleScorecardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SampleScorecardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SampleScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
