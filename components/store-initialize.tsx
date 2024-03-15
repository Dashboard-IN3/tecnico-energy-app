"use client"

// This component syncs the client side Zustand store with the server store
import { useStore } from "../app/lib/store"
import { useRef } from "react"

type Props = { selectedStudy: Studies.Study }

function StoreInitialize({ selectedStudy }: Props) {
  const { setSelectedStudy } = useStore()
  const study = useStore(state => state.studies[state.selectedStudyId])
  const initialized = useRef(false)

  if (!initialized.current && !study) {
    setSelectedStudy(selectedStudy, selectedStudy?.theme)
    initialized.current = true
  }
  return null
}

export default StoreInitialize
