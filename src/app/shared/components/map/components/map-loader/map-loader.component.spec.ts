import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLoaderComponent } from './map-loader.component';

describe('MapLoaderComponent', () => {
  let component: MapLoaderComponent;
  let fixture: ComponentFixture<MapLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
