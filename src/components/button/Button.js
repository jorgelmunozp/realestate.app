import './Button.scss';

export const Button = ({id='button', label='', onClick, className=''}) => {
  return (
   <button id={id} onClick={onClick} className={ `button ${className}`} aria-label={ ` ${label} button`}>{ label }</button>
  )
}
