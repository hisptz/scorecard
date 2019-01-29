import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizationLegendComponent } from './visualization-legend.component';

describe('VisualizationLegendComponent', () => {
  let component: VisualizationLegendComponent;
  let fixture: ComponentFixture<VisualizationLegendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VisualizationLegendComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizationLegendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
