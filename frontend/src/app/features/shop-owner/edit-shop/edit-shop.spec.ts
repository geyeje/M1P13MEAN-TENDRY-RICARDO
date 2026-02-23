import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditShop } from './edit-shop';

describe('EditShop', () => {
  let component: EditShop;
  let fixture: ComponentFixture<EditShop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditShop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditShop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
