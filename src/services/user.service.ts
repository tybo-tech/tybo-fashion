import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from 'src/models/user.model';
import { Constants, getId } from 'src/constants/Constants';
import { Company } from 'src/models/Company';
import { IMeasurement } from 'src/models/measurement.model';
import { Product } from 'src/models/Product';
import { Job } from 'src/models/job.model';
import { Router } from '@angular/router';
import { UxService } from './ux.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  url: string;
  private userBehaviorSubject?: BehaviorSubject<User>;
  public userObservable?: Observable<User>;

  private userListBehaviorSubject?: BehaviorSubject<User[]>;
  public userListObservable?: Observable<User[]>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private uxService: UxService
  ) {
    this.url = environment.api;

    let _user = localStorage.getItem(Constants.LocalUser);
    let user = undefined;
    if (_user && _user !== 'undefined') {
      user = JSON.parse(_user);
    }
    this.userBehaviorSubject = new BehaviorSubject<User>(user);
    this.userObservable = this.userBehaviorSubject.asObservable();

    this.userListBehaviorSubject = new BehaviorSubject<User[]>(user);
    this.userListObservable = this.userListBehaviorSubject.asObservable();
  }
  updateUserState(user: User) {
    if (this.userBehaviorSubject) this.userBehaviorSubject.next(user);
    if (user) localStorage.setItem(Constants.LocalUser, JSON.stringify(user));
    else localStorage.removeItem(Constants.LocalUser);
  }
  updateUserListState(users: User[]) {
    if (this.userListBehaviorSubject) this.userListBehaviorSubject.next(users);
  }
  changePassword(UserToken: string, Password: string) {
    return this.http.post<{
      isSuccess: boolean;
      message: string;
    }>(`${this.url}/user/change-password.php`, {
      UserToken,
      Password,
    });
  }
  public get getUser() {
    return this.userBehaviorSubject?.value;
  }
  save(data: User): Observable<User> {
    return this.http.post<User>(`${this.url}/user/save.php`, data);
  }
  updateUserDraftOrder(user: User, job: Job) {
    user.Metadata.DraftOrder = job;
    user.Metadata.DraftOrderId = getId('order');
  }
  saveCompany(data: Company): Observable<Company> {
    return this.http.post<Company>(`${this.url}/company/save.php`, data);
  }

  getStat(): Observable<any> {
    return this.http.get<any>(`${this.url}/user/get-admin-stat.php`);
  }
  getUserById(userId: number | string): Observable<User> {
    return this.http.get<User>(`${this.url}/user/get.php?UserId=${userId}`);
  }
  draft_order(id: string): Observable<User> {
    return this.http.get<User>(`${this.url}/user/draft-order.php?Id=${id}`);
  }
  getUsers(CompanyId: string, UserType = '') {
    return this.http.get<User[]>(
      `${this.url}/user/users.php?CompanyId=${CompanyId}&UserType=${UserType}`
    );
  }
  getShop(userId: number): Observable<User> {
    return this.http.get<User>(
      `${this.url}/user/get-shop.php?UserId=${userId}`
    );
  }

  login(data: { Email: string; Password: string }): Observable<User> {
    return this.http.post<User>(`${this.url}/user/login.php`, data);
  }
  verifyEmail(Email: string): Observable<User> {
    return this.http.get<User>(
      `${this.url}/user/get-by-email.php?Email=${Email}`
    );
  }
  logout(e: any) {
    if (this.userBehaviorSubject) this.userBehaviorSubject.next(e);
    localStorage.removeItem(Constants.LocalUser);
    this.router.navigate(['/home/sign-in']);
  }
  updateUserMeasurements(measurement: IMeasurement, user: User) {
    if (!user.Measurements || !user.Measurements.length) user.Measurements = [];
    const check = user.Measurements.find(
      (x) => x.Name.toLocaleLowerCase() === measurement.Name.toLowerCase()
    );
    if (check) {
      check.Value = measurement.Value;
      this.save(user).subscribe((data) => {
        if (data?.UserId) this.updateUserState(data);
      });
    } else {
      user.Measurements.push(measurement);
      this.save(user).subscribe((data) => {
        if (data?.UserId) this.updateUserState(data);
      });
    }
  }
  is_liked(product: Product) {
    return (
      this.getUser?.Metadata?.Favorites?.includes(product.ProductId) || false
    );
  }
  on_like(product: Product) {
    const user = this.getUser;
    if (!user) {
      const returnUrl = window.location.href;
      this.uxService.show_toast(
        'Please login or sign up to like this product',
        'Members Only',
        ['bg-secondary', 'text-white'],
        10000,
        '/home/sign-in?returnUrl=' + returnUrl,
        'Login'
      );
      // this.open(this.UX_MODALS.login);
      return;
    }
    if (!user.Metadata)
      user.Metadata = {
        Source: 'Online',
        Favorites: [],
        RatePerDay: 0,
        RatePerNight: 0,
      };
    if (!user.Metadata.Favorites) user.Metadata.Favorites = [];
    if (!user.Metadata.Favorites.includes(product.ProductId)) {
      user.Metadata.Favorites.push(product.ProductId);
    } else {
      user.Metadata.Favorites = user.Metadata.Favorites.filter(
        (x) => x !== product.ProductId
      );
    }
    this.save(user).subscribe((data) => {
      if (data?.UserId) {
        this.updateUserState(data);
        const liked = this.is_liked(product);
        this.uxService.show_toast(
          liked ? 'Added to favorites, this will be found in your profile' 
          :
           'Removed from favorites',
          'Done'
        );
      }
    });
  }
}
