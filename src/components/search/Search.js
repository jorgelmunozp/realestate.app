import { memo, useCallback, useRef, useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Input } from '../input/Input';
import './Search.scss';

export const Search = ({ value = '', onChange, handleChange, placeholder = 'Buscar...', Icon = FiSearch, className = '', debounceMs = 300, }) => {
  const change = onChange || handleChange;
  const [internal, setInternal] = useState(value || '');
  const timerRef = useRef(null);

  // Sincroniza el valor local cuando el valor principal cambie externamente
  useEffect(() => {
    if (value !== internal) setInternal(value || '');   // eslint-disable-next-line react-hooks/exhaustive-deps
    
  }, [value]);

  // Borrar temporizador al desmontar
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const handle = useCallback((next) => {
    setInternal(next);
    if (typeof change !== 'function') return;
    if (!debounceMs || debounceMs <= 0) {
      return change(next);
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      change(next);
    }, debounceMs);
  }, [change, debounceMs]);

  return (
    <div className={`search ${className}`.trim()}>
      <Input Icon={Icon} type="search" value={internal} placeholder={placeholder} handleChange={handle} />
    </div>
  );
};

export default memo(Search);
