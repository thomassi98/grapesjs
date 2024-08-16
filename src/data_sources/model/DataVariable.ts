import { Model } from '../../common';
import EditorModel from '../../editor/model/Editor';
import { stringToPath } from '../../utils/mixins';

export const DataVariableType = 'data-variable';

export default class DataVariable extends Model {
  em?: EditorModel;

  defaults() {
    return {
      type: DataVariableType,
      value: '',
      path: '',
    };
  }

  initialize(attrs: any, options: any) {
    super.initialize(attrs, options);
    this.em = options.em;
    this.listenToDataSource();

    return this;
  }

  listenToDataSource() {
    const { path } = this.attributes;
    const resolvedPath = stringToPath(path).join('.');

    if (this.em) {
      this.listenTo(this.em.DataSources, `change:${resolvedPath}`, this.onDataSourceChange);
    }
  }

  onDataSourceChange() {
    const newValue = this.getDataValue();
    this.set({ value: newValue });
  }

  getDataValue() {
    const { path } = this.attributes;
    const [dsId, drId, key] = stringToPath(path);
    const ds = this?.em?.DataSources.get(dsId);
    const dr = ds && ds.getRecord(drId);
    return dr?.get(key);
  }
}