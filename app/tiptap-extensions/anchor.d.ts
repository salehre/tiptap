import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    anchor: {
      setAnchor: (name: string) => ReturnType
    }
  }
}