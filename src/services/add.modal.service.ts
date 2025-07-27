import { Injectable } from '@angular/core';
import {
  IForm,
  IFormItem,
  IFormItemType,
  IFormSelectOption,
} from 'src/models/IForm';
import { Category, initCategory } from './category.service';

@Injectable({
  providedIn: 'root',
})
export class AddModalService {
  constructor() {}

  /** Form to add a new measurement */
  getMeasurementForm(): IForm {
    return this.buildForm('measurement', 'Add Measurement', 'Add', [
      this.buildInput('Name', 'text', 'Measurement Name...'),
    ]);
  }

  /** Form to add or edit a category */
  getCategoryForm(category: Category = initCategory('', '')): IForm {
    return this.buildForm('category', 'Add Category', 'Add', [
      this.buildInput('Name', 'text', 'Category name...', category.Name),
      this.buildInput('Description', 'textarea', 'Short description...', category.Description),
      this.buildInput('Image', 'image', 'Image URL...', category.ImageUrl || ''),
    ]);
  }

  /** Generic form builder */
  private buildForm(
    id: string,
    title: string,
    submitText: string,
    items: IFormItem[]
  ): IForm {
    return { id, title, submitText, items };
  }

  /** Generic input field builder */
  private buildInput(
    label: string,
    type: IFormItemType,
    placeholder = '',
    value: any = '',
    options: IFormSelectOption[] = []
  ): IFormItem {
    return { label, type, placeholder, value, options };
  }
}
