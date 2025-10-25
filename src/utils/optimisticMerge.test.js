import { mergeOptimistic } from './optimisticMerge';

describe('mergeOptimistic', () => {
  const a = { idProperty: 1, name: 'A' };
  const b = { idProperty: 2, name: 'B' };
  const c = { idProperty: 3, name: 'C' };

  it('prepends created item when not in server list', () => {
    const server = [a, b];
    const pending = [{ action: 'created', property: c }];
    const { merged, remaining } = mergeOptimistic(server, pending, 'idProperty');
    expect(merged[0].idProperty).toBe(3);
    expect(merged.length).toBe(3);
    expect(remaining.length).toBe(1); // stays pending until server returns it
  });

  it('reconciles when server already has the created item', () => {
    const server = [c, a, b];
    const pending = [{ action: 'created', property: c }];
    const { merged, remaining } = mergeOptimistic(server, pending, 'idProperty');
    expect(merged).toHaveLength(3);
    expect(remaining).toHaveLength(0);
  });

  it('updates item fields for updated action', () => {
    const server = [{ ...a, name: 'Old' }, b];
    const pending = [{ action: 'updated', property: { ...a, name: 'New' } }];
    const { merged, remaining } = mergeOptimistic(server, pending, 'idProperty');
    expect(merged.find(x => x.idProperty === 1).name).toBe('New');
    expect(remaining).toHaveLength(0);
  });

  it('keeps image from optimistic if provided', () => {
    const server = [a];
    const optImage = { file: 'base64data' };
    const pending = [{ action: 'created', property: c, image: optImage }];
    const { merged } = mergeOptimistic(server, pending, 'idProperty');
    expect(merged[0].image).toEqual(optImage);
  });
});

