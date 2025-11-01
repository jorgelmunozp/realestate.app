import './Label.scss';

export const Label = ({ text='', color='#000' }) => {
  return (
    <div className="label" style={{color:color}}><span>{ text }</span></div>
  )
}

export default Label;