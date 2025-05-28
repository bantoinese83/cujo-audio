"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  orientation?: "horizontal" | "vertical"
  thumbClassName?: string
}

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, orientation = "horizontal", thumbClassName, ...props }, ref) => (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex touch-none select-none items-center",
        orientation === "vertical" && "flex-col h-full",
        className,
      )}
      orientation={orientation}
      {...props}
    >
      <SliderPrimitive.Track
        className={cn(
          "relative grow overflow-hidden rounded-full bg-secondary/20",
          orientation === "horizontal" ? "h-2 w-full" : "h-full w-2",
        )}
      >
        <SliderPrimitive.Range
          className={cn("absolute bg-primary", orientation === "horizontal" ? "h-full" : "w-full bottom-0")}
        />
      </SliderPrimitive.Track>
      {props.value?.map((_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          className={cn(
            "block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            thumbClassName,
          )}
        />
      ))}
    </SliderPrimitive.Root>
  ),
)
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
