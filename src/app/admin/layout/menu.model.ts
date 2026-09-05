export interface IMenuGroup {
  name: string;
  items: IMenu[];
}

export interface IMenu {
  name: string;
  icon: string;
  url: string;
}
