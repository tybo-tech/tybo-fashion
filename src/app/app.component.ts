import { Component } from '@angular/core';
import { UpdateService } from './UpdateService';
import { UserService } from 'src/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  images = [944, 1011, 984].map((n) => `https://picsum.photos/id/${n}/900/500`);
  time = { hour: 13, minute: 30 };

  constructor(private updateService: UpdateService, private user : UserService, private router: Router) {
    const isAdmin  = user.getUser?.UserType === 'Admin';
    // isAdmin && this.router.navigate(['/store/admin']);
  }
}
