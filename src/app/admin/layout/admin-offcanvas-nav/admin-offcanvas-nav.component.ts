import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Company } from 'src/models/Company';
import { IMenuGroup } from '../menu.model';

declare global {
  interface Window {
    bootstrap?: {
      Offcanvas: {
        getInstance(el: HTMLElement): { hide(): void } | null;
      };
    };
  }
}

@Component({
  selector: 'app-admin-offcanvas-nav',
  templateUrl: './admin-offcanvas-nav.component.html',
})
export class AdminOffcanvasNavComponent implements OnDestroy {
  @Input() menu: IMenuGroup[] = [];
  @Input() company?: Company;
  @Input() currentUrl = '';
  @Output() logout = new EventEmitter<void>();

  private navSub?: Subscription;

  constructor(private router: Router, private el: ElementRef<HTMLElement>) {
    this.navSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) this.closeOffcanvas();
    });
  }

  get storeUrl(): string {
    return '/' + (this.company?.Slug || this.company?.CompanyId);
  }

  closeOffcanvas() {
    const el = this.el.nativeElement;
    if (window.bootstrap) {
      const instance = window.bootstrap.Offcanvas.getInstance(el);
      if (instance) instance.hide();
    }
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }
}
