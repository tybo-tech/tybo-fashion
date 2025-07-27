import { formatDate } from '@angular/common';
import { formated_date, getId } from 'src/constants/Constants';

export interface IComment {
  id: string;
  userId: string;
  userDisplayName: string;
  userImage: string;
  comment: string;
  date: string;
  attachment: string;
  status: string;
}

export function initComment(): IComment {
  return {
    id: getId('id'),
    userId: '',
    userDisplayName: '',
    userImage: '',
    comment: '',
    date: formated_date(),
    attachment: '',
    status: '',
  };
}
