import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodTitleComponent } from './period-title.component';

describe('PeriodTitleComponent', () => {
  let component: PeriodTitleComponent;
  let fixture: ComponentFixture<PeriodTitleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PeriodTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
