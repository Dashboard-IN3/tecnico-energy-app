const ToggleSwitch = ({ isChecked, setIsChecked }) => {
  const handleToggle = () => {
    setIsChecked(!isChecked)
  }

  return (
    <div className="flex items-center justify-center">
      <label htmlFor="toggle" className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            id="toggle"
            type="checkbox"
            className="hidden"
            checked={isChecked}
            onChange={handleToggle}
          />
          <div className="toggle__line w-10 h-4 bg-gray-400 rounded-full shadow-inner"></div>
          <div
            className={`toggle__dot absolute w-6 h-6 bg-white rounded-full shadow inset-y-0 left-0 ${
              isChecked ? "translate-x-6" : "translate-x-0"
            }`}
          ></div>
        </div>
        <div className="ml-3 text-gray-700 font-medium">Toggle</div>
      </label>
    </div>
  )
}

export default ToggleSwitch
