import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LatestSchemesComponent } from './latest-schemes.component';

describe('LatestSchemesComponent', () => {
  let component: LatestSchemesComponent;
  let fixture: ComponentFixture<LatestSchemesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LatestSchemesComponent]
    });
    fixture = TestBed.createComponent(LatestSchemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
