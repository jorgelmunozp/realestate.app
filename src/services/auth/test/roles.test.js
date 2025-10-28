import { rolesOf } from '../roles';

describe('rolesOf', () => {
  it('[] si null/undefined/""', () => {
    expect(rolesOf(null)).toEqual([]);
    expect(rolesOf(undefined)).toEqual([]);
    expect(rolesOf('')).toEqual([]);
    expect(rolesOf(' , , ')).toEqual([]);
  });
  it('string con comas -> tokens', () => {
    expect(rolesOf('admin, user , editor')).toEqual(['admin','user','editor']);
  });
  it('array -> limpia vacíos', () => {
    expect(rolesOf(['admin','',' user '])).toEqual(['admin','user']);
  });
  it('otros tipos -> stringify', () => {
    expect(rolesOf(123)).toEqual(['123']);
  });
});

