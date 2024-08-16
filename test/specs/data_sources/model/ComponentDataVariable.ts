import Editor from '../../../../src/editor/model/Editor';
import DataSourceManager from '../../../../src/data_sources';
import { DataSourceProps, DataSourcesEvents } from '../../../../src/data_sources/types';
import ComponentWrapper from '../../../../src/dom_components/model/ComponentWrapper';
import ComponentDataVariable from '../../../../src/data_sources/model/ComponentDataVariable';
import { DataVariableType } from '../../../../src/data_sources/model/DataVariable';

describe('ComponentDataVariable', () => {
  let em: Editor;
  let dsm: DataSourceManager;
  let fixtures: HTMLElement;
  let cmpRoot: ComponentWrapper;

  const addDataVariable = (path = 'ds1.id1.name') =>
    cmpRoot.append<ComponentDataVariable>({
      type: DataVariableType,
      value: 'default',
      path,
    })[0];

  const dsTest: DataSourceProps = {
    id: 'ds1',
    records: [
      { id: 'id1', name: 'Name1' },
      { id: 'id2', name: 'Name2' },
      { id: 'id3', name: 'Name3' },
    ],
  };
  const addDataSource = () => dsm.add(dsTest);

  beforeEach(() => {
    em = new Editor({
      mediaCondition: 'max-width',
      avoidInlineStyle: true,
    });
    dsm = em.DataSources;
    document.body.innerHTML = '<div id="fixtures"></div>';
    const { Pages, Components } = em;
    Pages.onLoad();
    cmpRoot = Components.getWrapper()!;
    const View = Components.getType('wrapper')!.view;
    const wrapperEl = new View({
      model: cmpRoot,
      config: { ...cmpRoot.config, em },
    });
    wrapperEl.render();
    fixtures = document.body.querySelector('#fixtures')!;
    fixtures.appendChild(wrapperEl.el);
  });

  afterEach(() => {
    em.destroy();
  });

  describe('Export', () => {
    test('component exports properly with default value', () => {
      const cmpVar = addDataVariable();
      expect(cmpVar.toHTML()).toBe('<div>default</div>');
    });

    test('component exports properly with current value', () => {
      addDataSource();
      const cmpVar = addDataVariable();
      expect(cmpVar.toHTML()).toBe('<div>Name1</div>');
    });

    test('component exports properly with variable', () => {
      addDataSource();
      const cmpVar = addDataVariable();
      expect(cmpVar.getInnerHTML({ keepVariables: true })).toBe('ds1.id1.name');
    });
  });

  test('component is properly initiliazed with default value', () => {
    const cmpVar = addDataVariable();
    expect(cmpVar.getEl()?.innerHTML).toBe('default');
  });

  test('component is properly initiliazed with current value', () => {
    addDataSource();
    const cmpVar = addDataVariable();
    expect(cmpVar.getEl()?.innerHTML).toBe('Name1');
  });

  test('component is properly updating on its default value change', () => {
    const cmpVar = addDataVariable();
    cmpVar.set({ value: 'none' });
    expect(cmpVar.getEl()?.innerHTML).toBe('none');
  });

  test('component is properly updating on its path change', () => {
    const eventFn1 = jest.fn();
    const eventFn2 = jest.fn();
    const ds = addDataSource();
    const cmpVar = addDataVariable();
    const el = cmpVar.getEl()!;
    const pathEvent = DataSourcesEvents.path;

    cmpVar.set({ path: 'ds1.id2.name' });
    expect(el.innerHTML).toBe('Name2');
    em.on(`${pathEvent}:ds1.id2.name`, eventFn1);
    ds.getRecord('id2')?.set({ name: 'Name2-UP' });

    cmpVar.set({ path: 'ds1[id3]name' });
    expect(el.innerHTML).toBe('Name3');
    em.on(`${pathEvent}:ds1.id3.name`, eventFn2);
    ds.getRecord('id3')?.set({ name: 'Name3-UP' });

    expect(el.innerHTML).toBe('Name3-UP');
    expect(eventFn1).toBeCalledTimes(1);
    expect(eventFn2).toBeCalledTimes(1);
  });

  describe('DataSource changes', () => {
    test('component is properly updating on data source add', () => {
      const eventFn = jest.fn();
      em.on(DataSourcesEvents.add, eventFn);
      const cmpVar = addDataVariable();
      const ds = addDataSource();
      expect(eventFn).toBeCalledTimes(1);
      expect(eventFn).toBeCalledWith(ds, expect.any(Object));
      expect(cmpVar.getEl()?.innerHTML).toBe('Name1');
    });

    test('component is properly updating on data source reset', () => {
      addDataSource();
      const cmpVar = addDataVariable();
      const el = cmpVar.getEl()!;
      expect(el.innerHTML).toBe('Name1');
      dsm.all.reset();
      expect(el.innerHTML).toBe('default');
    });

    test('component is properly updating on data source remove', () => {
      const eventFn = jest.fn();
      em.on(DataSourcesEvents.remove, eventFn);
      const ds = addDataSource();
      const cmpVar = addDataVariable();
      const el = cmpVar.getEl()!;
      dsm.remove('ds1');
      expect(eventFn).toBeCalledTimes(1);
      expect(eventFn).toBeCalledWith(ds, expect.any(Object));
      expect(el.innerHTML).toBe('default');
    });
  });

  describe('DataRecord changes', () => {
    test('component is properly updating on record add', () => {
      const ds = addDataSource();
      const cmpVar = addDataVariable('ds1[id4]name');
      const eventFn = jest.fn();
      em.on(`${DataSourcesEvents.path}:ds1.id4.name`, eventFn);
      const newRecord = ds.addRecord({ id: 'id4', name: 'Name4' });
      expect(cmpVar.getEl()?.innerHTML).toBe('Name4');
      newRecord.set({ name: 'up' });
      expect(cmpVar.getEl()?.innerHTML).toBe('up');
      expect(eventFn).toBeCalledTimes(1);
    });

    test('component is properly updating on record change', () => {
      const ds = addDataSource();
      const cmpVar = addDataVariable();
      const el = cmpVar.getEl()!;
      ds.getRecord('id1')?.set({ name: 'Name1-UP' });
      expect(el.innerHTML).toBe('Name1-UP');
    });

    test('component is properly updating on record remove', () => {
      const ds = addDataSource();
      const cmpVar = addDataVariable();
      const el = cmpVar.getEl()!;
      ds.removeRecord('id1');
      expect(el.innerHTML).toBe('default');
    });

    test('component is properly updating on record reset', () => {
      const ds = addDataSource();
      const cmpVar = addDataVariable();
      const el = cmpVar.getEl()!;
      ds.records.reset();
      expect(el.innerHTML).toBe('default');
    });
  });
});