import { memo, useCallback } from 'react';
import { FiPlus } from "react-icons/fi";
import './AddButton.scss';

export const AddButton = ({ label='', handleChange, className='' }) => {
  const handleInputChange = useCallback( handleChange, [handleChange]); // depende de handleChange, así no se rompe
    
  return (
    // <div className={`add-btn-container ${className}`}>
    // <button type="button" className="add-btn" onClick={ handleInputChange }><FiPlus /></button>
    // { label }
    // </div>
    <div className={`add-btn-container ${className}`}>
      <button type="button" onClick={ handleInputChange } className='add-btn-button'>
        <div className="add-btn-label"><FiPlus /></div>
        <label className='add-btn-text'>{ label }</label>
      </button>
    </div>
  )
}

export default memo(AddButton);