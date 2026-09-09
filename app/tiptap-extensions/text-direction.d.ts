import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textDirection: {
      setTextDirection: (direction: 'ltr' | 'rtl') => ReturnType
      unsetTextDirection: () => ReturnType
    }
  }
}