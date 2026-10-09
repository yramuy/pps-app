import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderBiographyComponent } from './leader-biography.component';

describe('LeaderBiographyComponent', () => {
  let component: LeaderBiographyComponent;
  let fixture: ComponentFixture<LeaderBiographyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LeaderBiographyComponent]
    });
    fixture = TestBed.createComponent(LeaderBiographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
