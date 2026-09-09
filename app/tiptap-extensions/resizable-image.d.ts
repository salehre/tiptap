import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      setImage: (attrs: { src: string; alt?: string; title?: string }) => ReturnType
      setImageAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setImageCaption: (caption: string | null) => ReturnType
    }
  }
}