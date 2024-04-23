import * as React from "react"
const SvgComponent = props => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} {...props}>
    <path fill="none" d="M0 0h16v16H0z" />
    <path d="M11 5h2v8.5c0 .825-.675 1.5-1.5 1.5h-7c-.825 0-1.5-.675-1.5-1.5V5h2v8h2V5h2v8h2V5zM2 2h12v2H2V2zm4-2h4v1H6V0z" />
  </svg>
)
export default SvgComponent
