import { memo, useCallback } from 'react';
import './Input.scss';

export const Input = ({ Icon=null, type='text', value, placeholder='', handleChange, setState }) => {
  const handleInputChange = useCallback((event) => handleChange(event.target.value), [handleChange]); // depende de handleChange, así no se rompe

  return (
    <div className="input-with-icon">
        {Icon && <Icon className="input-icon" />}
        <input type={type} value={value} onChange={ handleInputChange } placeholder={placeholder} />
    </div>
  )
}

export default memo(Input);