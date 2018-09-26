import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightedIndicatorsComponent } from './highlighted-indicators.component';

describe('HighlightedIndicatorsComponent', () => {
  let component: HighlightedIndicatorsComponent;
  let fixture: ComponentFixture<HighlightedIndicatorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighlightedIndicatorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightedIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
