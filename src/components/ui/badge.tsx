
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold font-mono uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/30 text-primary hover:bg-primary/40 neon-border",
        secondary:
          "border-transparent bg-secondary/70 text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/30 text-destructive hover:bg-destructive/40",
        outline: "text-foreground border-border/50 hover:bg-accent/20 hover:text-accent-foreground neon-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
