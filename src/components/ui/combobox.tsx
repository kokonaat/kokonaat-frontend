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
  value?: string
  // callback for when search is cleared
  onSearchClear?: () => void 
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
  value: controlledValue,
  onSearchClear,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(controlledValue || "")
  const [searchQuery, setSearchQuery] = React.useState("")
  const containerRef = React.useRef<HTMLDivElement>(null)

  // update internal value when controlled value changes
  React.useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue)
    }
  }, [controlledValue])

  // clear search when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (searchQuery) {
          clearSearch()
        }
      }
    }

    const handleFocusChange = () => {
      // small delay to allow for focus to move to the new element
      setTimeout(() => {
        if (containerRef.current && !containerRef.current.contains(document.activeElement)) {
          if (searchQuery && !open) {
            clearSearch()
          }
        }
      }, 100)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('focusin', handleFocusChange)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('focusin', handleFocusChange)
    }
  }, [searchQuery, open])

  const clearSearch = () => {
    setSearchQuery("")
    onSearch?.("")
    onSearchClear?.()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch?.(query)
  }

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue
    setValue(newValue)
    setOpen(false)
    // clear search after selection
    clearSearch()
    onSelect?.(newValue)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    // clear search query when closing the popover without selection
    if (!isOpen && searchQuery) {
      clearSearch()
    }
  }

  // get display label for selected value
  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = selectedOption?.label || placeholder

  return (
    <div ref={containerRef}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
            disabled={disabled}
          >
            <span className="truncate">{displayLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command
            // disable internal filtering
            filter={() => 1}
            shouldFilter={false}
          >
            <CommandInput
              placeholder="Search..."
              value={searchQuery}
              onValueChange={handleSearch}
            />
            <CommandList>
              {loading ? (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Searching...</span>
                  </div>
                </div>
              ) : (
                <>
                  {options.length === 0 ? (
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelect(option.value)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === option.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="truncate">{option.label}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}