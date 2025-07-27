export const Constants = {
  UnitsStore: 'UnitsStore',
  PassUrl: 'new-pass-8379543-in-7382',	
  OrderStatus: {
    Cart: 'Cart',
    Placed: 'Order Placed',
    Processing: 'Processing',
    Onway: 'On transit',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Notpaid: 'Not paid',
    WaitingForPaymentVerification: 'Waiting For Payment Verification',
    WaitingForProofOfPayment: 'Waiting for proof of payment',
  },
  Roles: ['Admin', 'Customer', 'Staff'],
  RolesObject: {
    Admin: 'Admin',
    Customer: 'Customer',
    Staff: 'Staff',
  },
  PaymentStatus: {
    Paid: 'Paid',
    Paying: 'Paying',
    Pending: 'Pending',
    Partial: 'Partial',
  },
  PaymentTypes: {
    Full: 'Full',
    Half: 'Half',
  },
  PaymentMethods: {
    Payfast: 'Payfast',
    Manual: 'Transfer',
  },
  Shippings: {
    Collect: 'Collect',
    Courier: 'Courier',
  },
  PayAmountTypes: {
    FullAmount: 'Full Amount',
    Half: '50% Deposit',
  },
  PayMethods: {
    Payfast: 'payfast',
    Transfer: 'transfer',
  },
  LocalOrder: 'localOrder',
  Email: 'mrnnmthembu@gmail.com',
  ContactPerson: 'Ndumiso Mthembu',
  LocalStorage: {
    Back: 'tybo__back',
    ScrollTo: 'tybo__scroll_to',
  },
  LocalUser: 'LocalUser',
  ProductTypes: ['Ready to wear', 'Custom'],
  ProductTypesValueLabel: [
    { label: 'Ready to wear', value: 'Ready to wear' },
    { label: 'Custom', value: 'Custom' },
  ],
  StockTypes: ['Stock product', 'Made To Order'],
  StockTypesValueLabel: [
    { label: 'Stock product', value: 'Stock product' },
    { label: 'Made To Order', value: 'Made To Order' },
  ],
  YesNo: ['Yes', 'No'],
  YesNoValueLabel: [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ],
  Units: ['Cm', 'Inches'],
  OnlineShopVisibility: [
    { Name: 'Show', Value: 1 },
    { Name: 'Hide', Value: 0 },
  ],
  ShippingOptions: [
    { name: 'Delivery', price: 150 },
    { name: 'Collection', price: 0 },
  ],
  DeliveryFee: 150,
  PrintInvoice: 'https://docs.tybofashion.co.za/invoice.php?orderId=',
  PrintJobCard: 'https://docs.tybofashion.co.za/job-card.php?id=',
};

export const objectToArray = (population: any): any[] => {
  const array = [];
  for (const key in population) {
    if (population.hasOwnProperty(key)) {
      array.push(population[key]);
    }
  }
  return array;
};

export const getId = (prefix: string = ''): string => {
  if (prefix && prefix.length) prefix += '-';
  return `${prefix}${Math.floor(
    Math.random() * 1000000000
  )}-${new Date().getTime()}`;
};

export function formated_date(date = new Date()): string {
  // 15 June 2021, 12:00 PM
  const month = date.toLocaleString('default', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

export const PaymentStatusList = objectToArray(Constants.PaymentStatus);
export const OrderStatusList = objectToArray(Constants.OrderStatus);

export const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
];
