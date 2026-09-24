/// <reference types="vite/client" />

interface Window {
  desktop: {
    minimize: () => void
    close: () => void
    togglePin: () => Promise<boolean>
    setCompact: (compact: boolean) => Promise<boolean>
  }
}
