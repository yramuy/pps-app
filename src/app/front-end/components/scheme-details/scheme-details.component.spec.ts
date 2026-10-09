import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeDetailsComponent } from './scheme-details.component';

describe('SchemeDetailsComponent', () => {
  let component: SchemeDetailsComponent;
  let fixture: ComponentFixture<SchemeDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SchemeDetailsComponent]
    });
    fixture = TestBed.createComponent(SchemeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
