import { getId } from 'src/constants/Constants';

export interface ICollection {
  Id: string;
  Name: string;
  ImageUrl: string;
  Status: string;
}

export const initCategory = (): ICollection => {
  return {
    Id: getId(),
    Name: '',
    ImageUrl: '',
    Status: 'Active',
  };
}
