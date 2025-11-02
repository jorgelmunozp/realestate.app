import { memo, useCallback } from 'react';
import './Input.scss';

export const Input = ({ id = 'input', Icon = null, type = 'text', value, placeholder = '', handleChange, setState }) => {
  const handleInputChange = useCallback((event) => {
    const next = event.target.value;
    if (typeof handleChange === 'function') return handleChange(next);
    if (typeof setState === 'function') return setState(next);
  }, [handleChange, setState]);

  return (
    <div className="input-with-icon">
      {Icon && <Icon className="input-icon" />}
      <input id={id} type={type} value={value} onChange={handleInputChange} placeholder={placeholder} aria-label={`${placeholder} input`} />
    </div>
  );
};

export default memo(Input);

