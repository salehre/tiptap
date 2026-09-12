import '@tiptap/core'

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        htmlBlock: {
            setHtmlBlock: (html: string) => ReturnType
        }
    }
}