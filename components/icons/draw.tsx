import * as React from "react"
const SvgComponent = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} {...props}>
    <path fill="none" d="M0 0h16v16H0z" />
    <path d="M4 12v1h8v-1h1V4h-1V3H4v1H3v8h1Zm3-5h2v2H7V7Zm9 5v4h-4v-1H4v1H0v-4h1V4H0V0h4v1h8V0h4v4h-1v8h1Z" />
  </svg>
)
export default SvgComponent
