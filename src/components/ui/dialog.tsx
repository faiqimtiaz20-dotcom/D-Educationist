import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogChromeContext = React.createContext({ hideClose: false })

const dialogContentVariants = cva(
  [
    'fixed left-1/2 top-1/2 z-50 grid w-full -translate-x-1/2 -translate-y-1/2',
    'gap-0 overflow-hidden rounded-xl border-0 bg-white shadow-2xl ring-1 ring-gray-200/80',
    'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'dark:bg-gray-900 dark:ring-gray-700/80',
    'flex max-h-[92vh] flex-col p-0',
    '[&>*:not([data-slot=dialog-header]):not([data-slot=dialog-footer]):not([data-slot=dialog-body])]:px-5',
    '[&>*:not([data-slot=dialog-header]):not([data-slot=dialog-footer]):not([data-slot=dialog-body])]:py-4',
  ].join(' '),
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        '2xl': 'max-w-5xl',
        '3xl': 'max-w-[72rem]',
        '4xl': 'max-w-[96vw] xl:max-w-7xl',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-primary/20 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className,
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  hideClose?: boolean
}

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size, hideClose = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogChromeContext.Provider value={{ hideClose }}>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(dialogContentVariants({ size }), className)}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogChromeContext.Provider>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  actions?: React.ReactNode
  showClose?: boolean
}

function DialogHeaderClose() {
  return (
    <DialogPrimitive.Close
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-white/90 transition-colors',
        'hover:bg-white/15 hover:text-white',
        'focus:outline-none focus-visible:bg-white/15 focus-visible:text-white',
        'disabled:pointer-events-none',
      )}
      aria-label="Close"
    >
      <X className="size-4" strokeWidth={2} />
    </DialogPrimitive.Close>
  )
}

const DialogHeader = ({ className, actions, showClose, children, ...props }: DialogHeaderProps) => {
  const { hideClose } = React.useContext(DialogChromeContext)
  const renderClose = showClose ?? !hideClose

  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'relative shrink-0 border-b border-primary/20 bg-gradient-to-r from-primary via-[#243f66] to-[#1a2f4a] px-5 py-3.5 text-left',
        renderClose ? 'pr-4' : 'pr-5',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1 pr-2">{children}</div>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {renderClose ? <DialogHeaderClose /> : null}
        </div>
      </div>
    </div>
  )
}

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-body"
    className={cn('min-h-0 flex-1 overflow-y-auto px-5 py-4', className)}
    {...props}
  />
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      'flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-gray-50/90 px-5 py-3.5 sm:flex-row sm:justify-end',
      'dark:border-gray-700 dark:bg-gray-900/60',
      className,
    )}
    {...props}
  />
)

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="dialog-title"
    className={cn('text-base font-semibold leading-none tracking-tight text-white', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="dialog-description"
    className={cn('text-xs text-white/75', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
