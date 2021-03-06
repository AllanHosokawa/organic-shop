import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Product } from 'shared/models/product';
import { take, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ShoppingCart } from 'shared/models/shopping-cart';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {

  constructor(private db: AngularFireDatabase) { }

  async getCart(): Promise<Observable<ShoppingCart>> {
    const cartId = await this.getOrCreateCartId();
    return this.db.object<ShoppingCart>('/shopping-carts/' + cartId).snapshotChanges()
      .pipe(map(x => {
        let items = x.payload.exists ? (x.payload.val().items) : {};
        return new ShoppingCart(items);
      }));
  }

  async addToCart(product: Product) {
    this.updateItem(product, 1);
  }

  async removeFromCart(product: Product) {
    this.updateItem(product, -1);
  }

  async clearCart() {
    let cartId = await this.getOrCreateCartId();
    this.db.object('/shopping-carts/' + cartId + '/items').remove();
  }

  private create() {
    return this.db.list('/shopping-carts').push({
      dateCreated: new Date().getTime()
    });
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

  private async updateItem(product: Product, change: number) {
    let cardId = await this.getOrCreateCartId();
    let item$ = this.getItem(cardId, product.key);

    item$.snapshotChanges().pipe(take(1)).subscribe(item => {
      let data = item.payload.val();
      let quantity = (data) ? data['quantity'] + change : 1;
      
      if(quantity === 0)
        item$.remove();
      else
        item$.update({
          title: product.title,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity: quantity
        });
    });
  }
}
