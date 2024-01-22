import { Model } from '../common';
import CategoryView from './ModuleCategoryView';

export interface CategoryProperties {
  /**
   * Category id.
   */
  id: string;
  /**
   * Category label.
   */
  label: string;
  /**
   * Category open state.
   * @default true
   */
  open?: boolean;
  /**
   * Category order.
   */
  order?: string | number;
  /**
   * Category attributes.
   * @default {}
   */
  attributes?: Record<string, any>;
}

export interface ItemsByCategory<T> {
  category?: Category;
  items: T[];
}

export default class Category extends Model<CategoryProperties> {
  view?: CategoryView;

  defaults() {
    return {
      id: '',
      label: '',
      open: true,
      attributes: {},
    };
  }

  getId() {
    return this.get('id')!;
  }

  getLabel() {
    return this.get('label')!;
  }
}