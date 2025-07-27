export interface IForm {
  id: string;
  title: string;
  submitText: string;
  items: IFormItem[];
}

export interface IFormItem {
  value: any;
  label: string;
  placeholder: string;
  options: IFormSelectOption[];
  type: IFormItemType;
}
export interface IFormSelectOption {
  value: string;
  label: string;
}
export type IFormItemType =
  | 'text'
  | 'email'
  | 'password'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'image'
  | 'time';
