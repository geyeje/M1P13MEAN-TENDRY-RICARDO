import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCartComponent } from './shopping-cart.component';

describe('ShoppingCartComponent', () => {
  let component: ShoppingCartComponent;
  let fixture: ComponentFixture<ShoppingCartComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartComponent],
      providers: [] // ShoppingCartService uses signal defaults so no provider needed
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShoppingCartComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('removes item when remove called', () => {
    component['cart'].add({ _id: 'p1', price: 5 } as any);
    component.remove('p1');
    expect(component.items()).toEqual([]);
  });

  it('updates quantity correctly', () => {
    component['cart'].add({ _id: 'p1', price: 5 } as any);
    component.updateQty('p1', 3);
    expect(component.items()[0].quantity).toBe(3);
  });
});
