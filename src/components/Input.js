import '../assets/styles/scss/components/Input.scss';

export const Input = ({ Icon, type='text', value, placeholder='', setState }) => {
  return (
    <div className="input-with-icon">
        <Icon className="input-icon" />
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setState(e.target.value)}
        />
    </div>
  )
}

export default Input;