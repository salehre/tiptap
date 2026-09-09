import '@tiptap/core'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    columnLayout: {
      setColumnLayout: (columns: number) => ReturnType
      addColumnRow: () => ReturnType
      removeColumnRow: () => ReturnType
      deleteColumnLayout: () => ReturnType
    }
  }
}