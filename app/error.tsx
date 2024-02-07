"use client" // Error components must be Client Components

import { useEffect } from "react"
import ErrorComponent from "next/error"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return <ErrorComponent title={error.message} statusCode={500} />
}
