import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandMarqueeComponent } from './brand-marquee.component';

describe('BrandMarqueeComponent', () => {
  let component: BrandMarqueeComponent;
  let fixture: ComponentFixture<BrandMarqueeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BrandMarqueeComponent]
    });
    fixture = TestBed.createComponent(BrandMarqueeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
