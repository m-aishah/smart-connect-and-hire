"use client";

import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const radioGroupVariants = cva("flex flex-col gap-2");

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

export function RadioGroup({
  value,
  onValueChange,
  children,
  className,
  ...props
}: RadioGroupProps) {
  // Add a debug console log to help track the current value
  React.useEffect(() => {
    console.log("RadioGroup current value:", value);
  }, [value]);

  return (
    <div
      role="radiogroup"
      className={cn(radioGroupVariants(), className)}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (
          React.isValidElement(child) &&
          child.type === RadioGroupItem
        ) {
          const itemValue = child.props.value;
          return React.cloneElement(child, {
            checked: itemValue === value,
            onChange: () => {
              console.log("RadioGroup changing to:", itemValue);
              onValueChange(itemValue);
            },
          });
        }
        return child;
      })}
    </div>
  );
}

export interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  checked?: boolean;
}

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className, checked, value, onChange, ...props }, ref) => {
  return (
    <input
      ref={ref}
      type="radio"
      value={value}
      checked={checked}
      onChange={(e) => {
        console.log("RadioGroupItem clicked:", value);
        if (onChange) {
          onChange(e);
        }
      }}
      className={cn(
        "h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300",
        className
      )}
      {...props}
    />
  );
});

RadioGroupItem.displayName = "RadioGroupItem";