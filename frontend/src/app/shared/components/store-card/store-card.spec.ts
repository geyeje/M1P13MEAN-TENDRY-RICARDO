import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StoreCard } from './store-card';

describe('StoreCard', () => {
  let component: StoreCard;
  let fixture: ComponentFixture<StoreCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCard, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
