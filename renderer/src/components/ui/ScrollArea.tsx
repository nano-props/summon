import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef, type Ref } from 'react'
import * as RSA from '@radix-ui/react-scroll-area'
import { cn } from '#/renderer/src/lib/utils.ts'

export type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both'

export interface ScrollAreaProps extends ComponentPropsWithoutRef<typeof RSA.Root> {
  orientation?: ScrollAreaOrientation
  viewportClassName?: string
  viewportRef?: Ref<HTMLDivElement>
  scrollBarClassName?: string
  thumbClassName?: string
}

export const ScrollArea = forwardRef<ComponentRef<typeof RSA.Root>, ScrollAreaProps>(function ScrollArea(
  {
    className,
    viewportClassName,
    viewportRef,
    children,
    orientation = 'vertical',
    type = 'hover',
    scrollHideDelay = 800,
    scrollBarClassName,
    thumbClassName,
    ...props
  },
  ref,
) {
  return (
    <RSA.Root
      ref={ref}
      type={type}
      scrollHideDelay={scrollHideDelay}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      <RSA.Viewport ref={viewportRef} className={cn('h-full w-full', viewportClassName)}>
        {children}
      </RSA.Viewport>
      {(orientation === 'vertical' || orientation === 'both') && (
        <ScrollBar orientation="vertical" className={scrollBarClassName} thumbClassName={thumbClassName} />
      )}
      {(orientation === 'horizontal' || orientation === 'both') && (
        <ScrollBar orientation="horizontal" className={scrollBarClassName} thumbClassName={thumbClassName} />
      )}
      <RSA.Corner className="bg-transparent" />
    </RSA.Root>
  )
})

interface ScrollBarProps extends ComponentPropsWithoutRef<typeof RSA.ScrollAreaScrollbar> {
  orientation?: 'vertical' | 'horizontal'
  thumbClassName?: string
}

export const ScrollBar = forwardRef<ComponentRef<typeof RSA.ScrollAreaScrollbar>, ScrollBarProps>(function ScrollBar(
  { className, orientation = 'vertical', thumbClassName, ...props },
  ref,
) {
  return (
    <RSA.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        'flex touch-none select-none p-0.5 transition-colors',
        'opacity-0 data-[state=visible]:opacity-100',
        'transition-opacity duration-200 ease-out',
        orientation === 'vertical' && 'h-full w-2 border-l border-l-transparent',
        orientation === 'horizontal' && 'w-full h-2 flex-col border-t border-t-transparent',
        className,
      )}
      {...props}
    >
      <RSA.ScrollAreaThumb
        className={cn(
          'relative flex-1 rounded-full bg-scrollbar-thumb',
          'transition-[background-color,width,height] duration-150 ease-out',
          'hover:bg-scrollbar-thumb-hover active:bg-scrollbar-thumb-active',
          orientation === 'vertical' && 'w-1 hover:w-1.5 mx-auto',
          orientation === 'horizontal' && 'h-1 hover:h-1.5 my-auto',
          'before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2',
          'before:h-full before:w-full before:min-h-[44px] before:min-w-[44px] before:content-[""]',
          thumbClassName,
        )}
      />
    </RSA.ScrollAreaScrollbar>
  )
})
