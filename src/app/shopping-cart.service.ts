import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Product } from './models/product';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private db: AngularFireDatabase) { }

  private create() {
    return this.db.list('/shopping-carts').push({
      dateCreated: new Date().getTime()
    });
  }

  async getCart() {
    let cartId = await this.getOrCreateCartId();
    return this.db.object('/shopping-carts/' + cartId).valueChanges();
  }

  private getItem(cardId: string, productId: string) {
    return this.db.object('/shopping-carts/' + cardId + '/items/' + productId);
  }

  private async getOrCreateCartId(): Promise<string> {
    let cartId = localStorage.getItem('cartId');
    
    if(cartId) return cartId;

    let result = await this.create();
    localStorage.setItem('cartId', result.key);
    
    return result.key;
  }

  async addToCart(product: Product) {
    let cardId = await this.getOrCreateCartId();
    let item$ = this.getItem(cardId, product.key);

    item$.snapshotChanges().pipe(take(1)).subscribe(item => {
        let data = item.payload.val();
        item$.update({ product: product, quantity: (data) ? data['quantity'] + 1 : 1 });
    });
  }
}
