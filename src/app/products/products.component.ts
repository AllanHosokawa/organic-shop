import { Component } from '@angular/core';
import { ProductService } from '../product.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../models/product';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  category: string;

  constructor(activatedRoute: ActivatedRoute, productService: ProductService) {
    productService.getAll()
      .pipe(switchMap(products => {
        this.products = products;
        return activatedRoute.queryParamMap;
      }))
      .subscribe(params => {
        this.category = params.get('category');
    
        this.filteredProducts = (this.category) ?
          this.products.filter(p => p.category === this.category) :
          this.products;
      });
  }
}
