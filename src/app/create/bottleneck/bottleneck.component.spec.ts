import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottleneckComponent } from './bottleneck.component';

describe('BottleneckComponent', () => {
  let component: BottleneckComponent;
  let fixture: ComponentFixture<BottleneckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottleneckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottleneckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
