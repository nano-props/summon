import * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HeaderButtonProps extends Omit<React.ComponentProps<typeof Button>, 'children' | 'variant' | 'size'> {
  icon: React.ReactElement
  title: string
  active?: boolean
}

export const HeaderButton = React.forwardRef<HTMLButtonElement, HeaderButtonProps>(
  ({ icon, title, active, className, ...props }, ref) => (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      title={title}
      tabIndex={-1}
      className={cn(
        'size-8',
        active && 'bg-foreground/10 text-foreground hover:bg-foreground/15',
        className,
      )}
      {...props}
    >
      {icon}
    </Button>
  ),
)
HeaderButton.displayName = 'HeaderButton'
