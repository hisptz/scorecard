import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScorecardDetailComponent } from './scorecard-detail.component';

describe('ScorecardDetailComponent', () => {
  let component: ScorecardDetailComponent;
  let fixture: ComponentFixture<ScorecardDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScorecardDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScorecardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
