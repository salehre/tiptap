import { Smartphone, Tablet, Laptop, Maximize } from '@lucide/vue'

export type PreviewViewport = 'sm' | 'md' | 'lg' | 'full'

export interface ViewportOption {
    value: PreviewViewport
    title: string
    icon: unknown
    width: string
}

export const PREVIEW_VIEWPORTS: ViewportOption[] = [
    { value: 'sm', title: 'موبایل', icon: Smartphone, width: '375px' },
    { value: 'md', title: 'تبلت', icon: Tablet, width: '768px' },
    { value: 'lg', title: 'دسکتاپ', icon: Laptop, width: '1024px' },
    { value: 'full', title: 'تمام صفحه', icon: Maximize, width: '100%' }
]