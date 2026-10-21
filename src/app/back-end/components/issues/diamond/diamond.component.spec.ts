import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiamondComponent } from './diamond.component';

describe('DiamondComponent', () => {
  let component: DiamondComponent;
  let fixture: ComponentFixture<DiamondComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiamondComponent]
    });
    fixture = TestBed.createComponent(DiamondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
