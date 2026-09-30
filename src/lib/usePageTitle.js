import { useEffect } from 'react'

// Update the browser title without adding a metadata dependency.
export default function usePageTitle(title) {
  useEffect(() => {
    document.title = `${title} | BrightBridge`
  }, [title])
}
