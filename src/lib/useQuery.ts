import { useCallback, useEffect, useRef, useState } from "react"
import { toUserMessage } from "./errors"

export const useQuery = <T,>(key: string, loader: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)
  const loaderRef = useRef(loader)

  useEffect(() => {
    loaderRef.current = loader
  })

  const reload = useCallback(() => {
    setTick((value) => value + 1)
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    setLoading(true)
    setError(null)

    loaderRef
      .current()
      .then((result) => {
        if (ac.signal.aborted) return
        setData(result)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return
        setData(null)
        setError(toUserMessage(err))
        setLoading(false)
      })

    return () => {
      ac.abort()
    }
  }, [key, tick])

  return { data, error, loading, reload }
}
