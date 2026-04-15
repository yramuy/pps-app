import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MandalsListComponent } from './mandals-list.component';

describe('MandalsListComponent', () => {
  let component: MandalsListComponent;
  let fixture: ComponentFixture<MandalsListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MandalsListComponent]
    });
    fixture = TestBed.createComponent(MandalsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
