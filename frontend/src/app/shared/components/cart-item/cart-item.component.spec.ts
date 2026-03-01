import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { CartItemComponent } from './cart-item.component';

describe('CartItemComponent', () => {
  let component: CartItemComponent;
  let fixture: ComponentFixture<CartItemComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartItemComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits remove event', () => {
    let emitted: string | undefined;
    component.remove.subscribe(val => (emitted = val));
    component.item = signal({ product: { _id: 'p1', name: 'A' } as any, quantity: 1 }) as any;
    component.onRemove();
    expect(emitted).toBe('p1');
  });

  it('emits quantityChange when adjusting', () => {
    let payload: any;
    component.quantityChange.subscribe(v => (payload = v));
    component.item = signal({ product: { _id: 'p1' } as any, quantity: 2 }) as any;
    component.changeQty(1);
    expect(payload).toEqual({ productId: 'p1', quantity: 3 });
  });

  it('calls remove event when quantity drops to zero', () => {
    let removed: string | undefined;
    component.remove.subscribe(v => (removed = v));
    component.item = signal({ product: { _id: 'p1' } as any, quantity: 1 }) as any;
    component.changeQty(-1);
    expect(removed).toBe('p1');
  });
});
