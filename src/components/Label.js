import '../assets/styles/scss/components/Label.scss';

export const Label = ({ text='' }) => {
  return (
    <div className="label"><span>{ text }</span></div>
  )
}

export default Label;