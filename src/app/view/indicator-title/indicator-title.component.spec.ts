import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndicatorTitleComponent } from './indicator-title.component';

describe('IndicatorTitleComponent', () => {
  let component: IndicatorTitleComponent;
  let fixture: ComponentFixture<IndicatorTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndicatorTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndicatorTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
