import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICollection, initCategory } from 'src/models/Category';
import { Company } from 'src/models/Company';
import { User } from 'src/models/user.model';
import { UX_MODALS, UxModel } from 'src/models/ux.model';
import { Category } from 'src/services/category.service';
import { JobService } from 'src/services/job.service';
import { UserService } from 'src/services/user.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-tui-nav',
  templateUrl: './tui-nav.component.html',
  styleUrls: ['./tui-nav.component.scss'],
})
export class TuiNavComponent {
  showFavourite() {
    this.uxService.show_modal(UX_MODALS.favorites);
  }

  @Input() company?: Company;
  @Input() showShare = false;
  @Output() onShare = new EventEmitter();

  user?: User;
  logo = '';
  UX_MODALS = UX_MODALS;
  showProfileNav = false;
  menuOpen = false;

  // placeholder for featured collections
  collections: Category[] = [];
  ux?: UxModel;

  constructor(
    private jobService: JobService,
    public uxService: UxService,
    private userServcice: UserService
  ) {
    userServcice.userObservable?.subscribe((user) => {
      this.user = user;
    });
    uxService.$ux.subscribe((ux) => {
      this.ux = ux;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    if (this.menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  get companyLogo() {
    return this.company?.Metadata?.WebLogo || this.logo;
  }

  get slug() {
    return this.company?.Slug || '';
  }

  logout() {
    this.userServcice.logout(undefined);
  }

  toggleProfileNav(event: MouseEvent) {
    event.stopPropagation();
    const id = (event.target as any)?.id;
    const ids = ['user-name', 'user-icon', 'profile-nav-overlay'];
    if (ids.includes(id)) {
      this.showProfileNav = !this.showProfileNav;
    }
  }
}
