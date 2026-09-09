import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (term: string) => ReturnType
      nextMatch: () => ReturnType
      previousMatch: () => ReturnType
      replaceActive: (replacement: string) => ReturnType
      replaceAll: (replacement: string) => ReturnType
    }
  }
}
