import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IKey, UX_MODALS, UxModel } from 'src/models/ux.model';

@Injectable({
  providedIn: 'root',
})
export class UxService {
  private uxBehaviorSubject: BehaviorSubject<UxModel>;
  public $ux: Observable<UxModel>;

  // Confirm
  private confirmBehaviorSubject = new BehaviorSubject<boolean>(false);
  $confirm = this.confirmBehaviorSubject.asObservable();

  private loadingSub = new BehaviorSubject<boolean>(false);
  $loading = this.loadingSub.asObservable();

  constructor() {
    //UX
    this.uxBehaviorSubject = new BehaviorSubject<UxModel>({});
    this.$ux = this.uxBehaviorSubject.asObservable();
    //open modal
    // this.show_modal(UX_MODALS.payments);
  }
  updateUXState(ux: UxModel) {
    if (this.uxBehaviorSubject) this.uxBehaviorSubject.next(ux);
  }
  show_modal(modal: string, data_id = '') {
    const state = this.uxBehaviorSubject?.value;
    if (!state) {
      this.updateUXState({ Modal: modal, data_id });
      return;
    }
    const newState = { ...state, Modal: modal, data_id };
    this.updateUXState(newState);
  }
  show_login_modal() {
    this.show_modal(UX_MODALS.login);
  }
  show_cart_modal() {
    this.show_modal(UX_MODALS.cart);
  }
  close_ux_modals() {
    const state = this.uxBehaviorSubject?.value;
    if (!state) return;
    const newState = { ...state, Modal: '' };
    this.updateUXState(newState);
  }
  clear_toast() {
    const state = this.uxBehaviorSubject?.value;
    if (!state) return;
    const newState: UxModel = { ...state, Toast: undefined };
    this.updateUXState(newState);
  }
  show_toast(
    message: string,
    title: string,
    classess: string[] = ['bg-success', 'text-white'],
    duration = 5000,
    link?: string,
    linkText?: string,
  ) {
    const state = this.uxBehaviorSubject?.value;
    if (!state) return;
    const newState: UxModel = {
      ...state,
      Toast: {
        Message: message,
        Title: title,
        Classes: classess,
        Link: link,
        LinkText: linkText,
      },
    };
    this.updateUXState(newState);
    setTimeout(() => {
      this.clear_toast();
    }, duration);
  }

  // Start Confirm
  show_confirm(title: string, message: string) {
    const state = this.uxBehaviorSubject?.value;
    if (!state) return;
    const newState: UxModel = {
      ...state,
      Confirm: { Title: title, Message: message, Show: true },
    };
    this.updateUXState(newState);
  }
  onConfirm(answer: boolean) {
    this.confirmBehaviorSubject.next(answer);
    const state = this.uxBehaviorSubject?.value;
    if (!state) return;
    const newState: UxModel = {
      ...state,
      Confirm: { Title: '', Message: '', Show: false },
    };
    this.updateUXState(newState);
  }

  // End Confirm
  load(e: boolean) {
    this.loadingSub.next(e);
  }
  public get ux() {
    return this.uxBehaviorSubject?.value;
  }

  randomSoftColor(seed?: string): string {
    const hash = seed
      ? Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : Math.random() * 360;
    const hue = hash % 360; // Spread across full hue spectrum
    const saturation = 50 + Math.random() * 20; // Keep colors professional
    const lightness = 70 + Math.random() * 10; // Soft, pastel look

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  onShare(name: string, description: string, url = window.location.href) {
    if (navigator.share) {
      navigator
        .share({
          title: name,
          text: description,
          url: url,
        })
        .then(() => console.log('Successful share'))
        .catch((error) => console.log('Error sharing', error));
    } else {
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.show_toast('Link copied to clipboard', 'Copied', [
        'bg-success',
        'text-white',
      ]);
    }
  }
}
