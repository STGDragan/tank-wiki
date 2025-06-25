
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium font-sans uppercase tracking-wide ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 touch-target hover:transform hover:-translate-y-0.5",
  {
    variants: {
      variant: {
        default: "cyber-button bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/50 text-primary hover:from-primary/30 hover:to-accent/30 hover:border-primary/70 hover:shadow-cyber",
        destructive:
          "bg-destructive/20 border border-destructive/50 text-destructive hover:bg-destructive/30 hover:border-destructive/70 hover:shadow-[0_0_10px_rgb(255,76,76,0.3)]",
        outline:
          "border border-border bg-background/50 backdrop-blur-sm hover:bg-accent/10 hover:text-accent-foreground hover:border-accent/50",
        secondary:
          "bg-secondary/50 text-secondary-foreground hover:bg-secondary/70 border border-secondary/30 hover:border-secondary/50",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline neon-text",
        cta: "bg-gradient-to-r from-cta/80 to-primary/80 text-white border border-cta/50 hover:from-cta hover:to-primary hover:shadow-cyber-lg font-bold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
