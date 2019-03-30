import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Product } from './models/product';
import { take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ShoppingCart } from './models/shopping-cart';

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

  async getCart(): Promise<Observable<ShoppingCart>> {
    const cartId = await this.getOrCreateCartId();
    return this.db.object<ShoppingCart>('/shopping-carts/' + cartId).snapshotChanges()
      .pipe(map(x => {
        let items = x.payload.exists ? (x.payload.val().items) : {};
        return new ShoppingCart(items);
      }));
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
    this.updateItem(product, 1);
  }

  async removeFromCart(product: Product) {
    this.updateItem(product, -1);
  }

  private async updateItem(product: Product, change: number) {
    let cardId = await this.getOrCreateCartId();
    let item$ = this.getItem(cardId, product.key);

    item$.snapshotChanges().pipe(take(1)).subscribe(item => {
      let data = item.payload.val();
      item$.update({
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity: (data) ? data['quantity'] + change : 1
      });
    });
  }
}
