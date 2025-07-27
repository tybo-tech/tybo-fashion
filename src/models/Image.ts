export interface Image {
  ImageId?: string;
  OtherId: string;
  OptionId: string;
  Url: string;
  IsMain: string;
  CreateDate?: string;
  CreateUserId: string;
  ModifyDate?: string;
  ModifyUserId: string;
  StatusId: number;
  Classes?: string[];
  Show?: boolean;
  Styles: any;
}

export const initImage = (url =''): Image => {
  return {
    CreateUserId: '',
    IsMain: '',
    ModifyUserId: '',
    OptionId: '',
    OtherId: '',
    StatusId: 1,
    Styles: {},
    Url: url,
  };
};
