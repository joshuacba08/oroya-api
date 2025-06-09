import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        gradient:
          "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg",
        success:
          "bg-green-600 text-white shadow-sm hover:bg-green-700 focus:ring-green-500",
        warning:
          "bg-yellow-600 text-white shadow-sm hover:bg-yellow-700 focus:ring-yellow-500",
        info: "bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500",
        action:
          "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300",
        "action-primary":
          "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 shadow-sm hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600",
        "action-success":
          "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 shadow-sm hover:bg-green-50 hover:border-green-300 hover:text-green-600",
        "action-danger":
          "bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 shadow-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600",
        nav: "text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        "nav-active": "bg-primary text-primary-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7 p-1.5",
        "icon-xs": "h-6 w-6 p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
