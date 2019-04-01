import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { ShoppingCartService } from './shopping-cart.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private db: AngularFireDatabase, private shoppingCartService: ShoppingCartService) { }

  async placeOrder(order) {
    let result = await this.db.list('/orders').push(order);
    this.shoppingCartService.clearCart();

    return result;
  }

  getOrders() {
    return this.db.list('/orders')
      .snapshotChanges().pipe(
        map(orders => orders.map(o => ({ key: o.key, ...o.payload.val() })))
      );
  }

  getOrdersByUser(userId: string) {
    return this.db.list('/orders',
      ref => ref.orderByChild('userId').equalTo(userId))
      .snapshotChanges().pipe(
        map(orders => orders.map(o => ({ key: o.key, ...o.payload.val() })))
      );
  }
}
