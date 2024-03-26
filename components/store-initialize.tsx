"use client"

// This component syncs the client side Zustand store with the server store
import { useStore } from "../app/lib/store"
import { useRef } from "react"

type Props = { stateObject: { selectedStudy: Studies.Study } }

function StoreInitialize({ stateObject }: Props) {
  const initialized = useRef(false)

  if (!initialized.current) {
    useStore.setState(stateObject)
    initialized.current = true
  }
  return null
}

export default StoreInitialize
