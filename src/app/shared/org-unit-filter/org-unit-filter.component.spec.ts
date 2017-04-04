import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgUnitFilterComponent } from './org-unit-filter.component';

describe('OrgUnitFilterComponent', () => {
  let component: OrgUnitFilterComponent;
  let fixture: ComponentFixture<OrgUnitFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrgUnitFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgUnitFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
