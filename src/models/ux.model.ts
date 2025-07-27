export interface UxModel {
  Toast?: { Message: string; Title?: string; Classes?: string[], Link?: string, LinkText?: string };
  // Loading?: boolean;
  ReturnUrl?: string;
  Modal?: string;
  data_id?: string;
  Confirm?: { Title: string; Message: string; Show: boolean };
}

export const UX_MODALS = {
  login: 'login',
  register: 'register',
  forgot: 'forgot',
  payments: 'payments',
  reset: 'reset',
  cart: 'cart',
  delivery_method: 'delivery-method',
  customer_contact: 'customer-contact',
  shipping_info: 'shipping-info',
  verify: 'verify',
  banking_details: 'banking-details',
  edit_user: 'edit-user',

  // Profile
  profile: 'profile',
  favorites: 'favorites',
  profile_contact: 'profile-contact',
  profile_address: 'profile-address',
  profile_orders: 'profile-orders',
  profile_order: 'profile-order',
  profile_password: 'profile-password',
  profile_measurements: 'profile-measurements',
};

export interface IKey {
  Shift?: boolean;
}
export interface IMoving {
  Id: string;
  Name: string;
  ElementId?: string;
  Image?: string;
}
export interface IKeyValue {
  Key: string;
  Value: string;
  Style?: string;
  Image?: string;
}

export const kv = (): IKeyValue => {
  return { Key: '', Value: '' };
};

export function loading() {
  const check = document.querySelector('.loading');
  if (check) return;
  const loading = document.createElement('div');
  loading.classList.add('loading');
  document.body.appendChild(loading);
}
export function stop_loading() {
  const loading = document.querySelector('.loading');
  loading?.remove();
}
export interface ICheckoutNav {
  title: string;
  subTitle: string;
  back: string;
  hideBack?: boolean;
}
