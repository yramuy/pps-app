import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipProfilesComponent } from './vip-profiles.component';

describe('VipProfilesComponent', () => {
  let component: VipProfilesComponent;
  let fixture: ComponentFixture<VipProfilesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VipProfilesComponent]
    });
    fixture = TestBed.createComponent(VipProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
