import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandalsAddComponent } from './mandals-add.component';

describe('MandalsAddComponent', () => {
  let component: MandalsAddComponent;
  let fixture: ComponentFixture<MandalsAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MandalsAddComponent]
    });
    fixture = TestBed.createComponent(MandalsAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
