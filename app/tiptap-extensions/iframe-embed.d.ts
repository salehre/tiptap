import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframeEmbed: {
      setIframeEmbed: (src: string) => ReturnType
    }
  }
}