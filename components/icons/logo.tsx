import * as React from "react"
const SvgComponent = props => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    {...props}
  >
    <path
      fill="#E0A436"
      fillRule="evenodd"
      d="M10.429 22.889c5.33-.763 9.428-5.347 9.428-10.889 0-5.542-4.098-10.126-9.428-10.889A11.092 11.092 0 0 1 12 1c6.075 0 11 4.925 11 11s-4.925 11-11 11c-.534 0-1.058-.038-1.571-.111Z"
      clipRule="evenodd"
    />
    <path
      fill="#FFC357"
      fillRule="evenodd"
      d="M7.286 21.941a11.045 11.045 0 0 1-4.19-3.482v-5.627h4.189v9.11ZM12.524 22.374c-.671.237-1.372.411-2.095.515a10.931 10.931 0 0 1-2.096-.515V8.21l2.096-1.972 2.095 1.972v14.164ZM17.762 18.46a11.045 11.045 0 0 1-4.19 3.481v-9.11l2.095-1.355 2.095 1.356v5.627Z"
      clipRule="evenodd"
    />
    <path
      fill="#064694"
      fillRule="evenodd"
      d="M8.333 8.21v14.164a10.941 10.941 0 0 1-1.047-.433v-9.11l-2.133.001H3.095v5.627A10.95 10.95 0 0 1 1 12C1 6.458 5.098 1.874 10.429 1.111a10.978 10.978 0 0 1 6.552 3.473A10.96 10.96 0 0 1 19.857 12a10.95 10.95 0 0 1-2.095 6.46v-5.628H13.572v9.11c-.34.16-.69.305-1.048.432V8.21H8.333Z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgComponent
