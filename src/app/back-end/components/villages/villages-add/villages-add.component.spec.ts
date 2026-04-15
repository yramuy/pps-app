import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VillagesAddComponent } from './villages-add.component';

describe('VillagesAddComponent', () => {
  let component: VillagesAddComponent;
  let fixture: ComponentFixture<VillagesAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VillagesAddComponent]
    });
    fixture = TestBed.createComponent(VillagesAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
