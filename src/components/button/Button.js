import './Button.scss';

export const Button = ({label='', onClick, className=''}) => {
  return (
   <button onClick={onClick} className={ `button ${className}`}>{ label }</button>
  )
}
