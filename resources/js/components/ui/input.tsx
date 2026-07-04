import * as React from "react"

import { useFieldId } from "@/components/ui/field"
import { Icon, type IconName } from "@/components/ui/icon"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  /** Optional leading icon rendered inside the field (Tappy `.input-affix` style). */
  icon?: IconName
  /** Classes applied to the wrapping element when an `icon` is present (e.g. `flex-1`). */
  wrapperClassName?: string
}

const baseClasses =
  "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

function Input({ className, type, icon, wrapperClassName, id, ...props }: InputProps) {
  const fieldId = useFieldId(id)

  if (!icon) {
    return (
      <input
        type={type}
        id={fieldId}
        data-slot="input"
        className={cn(baseClasses, className)}
        {...props}
      />
    )
  }

  return (
    <div className={cn("relative flex w-full items-center", wrapperClassName)}>
      <Icon
        name={icon}
        className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
      />
      <input
        type={type}
        id={fieldId}
        data-slot="input"
        className={cn(baseClasses, "pl-9", className)}
        {...props}
      />
    </div>
  )
}

export { Input }
