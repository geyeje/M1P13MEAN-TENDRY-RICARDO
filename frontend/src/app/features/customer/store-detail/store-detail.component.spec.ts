import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StoreDetail } from './store-detail.component';

describe('StoreDetail', () => {
  let component: StoreDetail;
  let fixture: ComponentFixture<StoreDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDetail, RouterTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(StoreDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
