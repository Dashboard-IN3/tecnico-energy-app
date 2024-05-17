import * as React from "react"
const SvgComponent = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} {...props}>
    <path fill="none" d="M0 0h16v16H0z" />
    <path d="M5 11V4.5a1.5 1.5 0 0 1 3 0V8h1.528c.31 0 .617.072.894.211l2.472 1.236A2 2 0 0 1 14 11.236V14a2 2 0 0 1-2 2H6.702c-.455 0-.895-.155-1.25-.438L1 12a1 1 0 0 1 1-1h3ZM2 4.5C2 2.016 4.016 0 6.5 0S11 2.016 11 4.5H9a2.5 2.5 0 0 0-5 0H2Z" />
  </svg>
)
export default SvgComponent
