import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BronzeComponent } from './bronze.component';

describe('BronzeComponent', () => {
  let component: BronzeComponent;
  let fixture: ComponentFixture<BronzeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BronzeComponent]
    });
    fixture = TestBed.createComponent(BronzeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
