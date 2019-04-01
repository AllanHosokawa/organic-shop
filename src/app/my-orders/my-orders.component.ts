import { Component } from '@angular/core';
import { OrderService } from '../order.service';
import { AuthService } from '../auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent {
  orders$;
  
  constructor(authService: AuthService,
    orderService: OrderService) {
    this.orders$ = authService.user$
      .pipe(switchMap(user => orderService.getOrdersByUser(user.uid)));
  }
}
