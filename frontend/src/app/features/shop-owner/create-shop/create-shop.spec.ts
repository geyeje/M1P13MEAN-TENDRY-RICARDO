import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateShop } from './create-shop';

describe('CreateShop', () => {
  let component: CreateShop;
  let fixture: ComponentFixture<CreateShop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateShop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateShop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
