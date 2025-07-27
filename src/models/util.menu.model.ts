export interface IMenu {
  name: string;
  link?: string;
  count?: number;
  description?: string;
  icon?: string;
  id?: string;
  id2?: string;
}

export interface IMenuGroup {
  name: string;
  items: IMenu[];
}