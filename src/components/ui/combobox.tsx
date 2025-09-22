// import * as React from "react"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"

// export type ComboboxOption = { value: string; label: string }

// interface ComboboxProps {
//   options?: ComboboxOption[]
//   placeholder?: string
//   emptyMessage?: string
//   onSelect?: (value: string) => void
//   onSearch?: (query: string) => void   // 🔥 new
//   loading?: boolean                    // 🔥 show spinner
//   className?: string
//   disabled?: boolean
// }

// export function Combobox({
//   options = [],
//   placeholder = "Select option...",
//   emptyMessage = "No results found.",
//   onSelect,
//   onSearch,
//   loading = false,
//   className,
//   disabled = false,
// }: ComboboxProps) {
//   const [open, setOpen] = React.useState(false)
//   const [value, setValue] = React.useState("")

//   return (
//     <Popover open={open} onOpenChange={setOpen}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="outline"
//           role="combobox"
//           aria-expanded={open}
//           className={cn("justify-between", className)}
//           disabled={disabled}
//         >
//           {value
//             ? options.find((option) => option.value === value)?.label
//             : placeholder}
//           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//         </Button>
//       </PopoverTrigger>

//       <PopoverContent className="w-[240px] p-0">
//         <Command>
//           <CommandInput
//             placeholder="Search..."
//             onValueChange={(q) => onSearch?.(q)} // 🔥 call API hook
//           />
//           <CommandList>
//             {loading ? (
//               <div className="p-2 text-sm text-muted-foreground">
//                 Searching...
//               </div>
//             ) : (
//               <>
//                 <CommandEmpty>{emptyMessage}</CommandEmpty>
//                 <CommandGroup>
//                   {options.map((option) => (
//                     <CommandItem
//                       key={option.value}
//                       value={option.value}
//                       onSelect={(currentValue) => {
//                         setValue(currentValue === value ? "" : currentValue)
//                         setOpen(false)
//                         onSelect?.(currentValue)
//                       }}
//                     >
//                       <Check
//                         className={cn(
//                           "mr-2 h-4 w-4",
//                           value === option.value ? "opacity-100" : "opacity-0"
//                         )}
//                       />
//                       {option.label}
//                     </CommandItem>
//                   ))}
//                 </CommandGroup>
//               </>
//             )}
//           </CommandList>
//         </Command>
//       </PopoverContent>
//     </Popover>
//   )
// }

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type ComboboxOption = { value: string; label: string }

interface ComboboxProps {
  options?: ComboboxOption[]
  placeholder?: string
  emptyMessage?: string
  onSelect?: (value: string) => void
  onSearch?: (query: string) => void
  loading?: boolean
  className?: string
  disabled?: boolean
}

export function Combobox({
  options = [],
  placeholder = "Select option...",
  emptyMessage = "No results found.",
  onSelect,
  onSearch,
  loading = false,
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={disabled}
        >
          {value
            ? options.find((option) => option.value === value)?.label
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[240px] p-0">
        <Command>
          <CommandInput
            placeholder="Search..."
            onValueChange={(q) => onSearch?.(q)}
          />
          <CommandList>
            {loading ? (
              <div className="p-2 text-sm text-muted-foreground">Searching...</div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? "" : currentValue)
                        setOpen(false)
                        onSelect?.(currentValue)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}