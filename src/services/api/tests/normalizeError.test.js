import { flattenErrors, normalizeError } from '../../api/errorWrapper';

describe('flattenErrors', () => {
  it('maneja null/undefined', () => expect(flattenErrors(null)).toEqual([]));
  it('aplana arrays/objetos/strings', () => {
    expect(flattenErrors(['a','b'])).toEqual(['a','b']);
    expect(flattenErrors({name:['req'],age:'>18'})).toEqual(['req','>18']);
    expect(flattenErrors('boom')).toEqual(['boom']);
  });
});

describe('normalizeError', () => {
  const http = (status, data, statusText='ERR') => ({ response:{ status, data, statusText } });

  it('envoltorio plano con success=false', () => {
    const e = http(400,{ message:'Bad', errors:{name:['req']} });
    const n = normalizeError(e);
    expect(n).toEqual(expect.objectContaining({ Success:false, StatusCode:400 }));
    expect(n.Errors).toEqual(expect.arrayContaining(['req']));
    expect(typeof n.Message).toBe('string');
  });

  it('cuando no hay response -> fallback message', () => {
    const n = normalizeError(new Error('offline'));
    expect(n.Success).toBe(false);
    expect(n.Errors.length>=0).toBe(true);
    expect(n.Message).toMatch(/offline|Error/i);
  });
});
