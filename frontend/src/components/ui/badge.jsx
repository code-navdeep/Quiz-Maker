import * as React from "react"
import { cva } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-800",
        secondary: "border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200",
        destructive: "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "text-gray-950 border-gray-300",
        easy: "border-transparent bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg",
        medium: "border-transparent bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg",
        hard: "border-transparent bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg",
        glass: "backdrop-blur-lg bg-white/20 border-white/30 text-white shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Badge = React.forwardRef(({ className, variant, animated = true, ...props }, ref) => {
  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        whileHover={{ scale: 1.1 }}
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }

  return (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
})
Badge.displayName = "Badge"

export { Badge, badgeVariants }
