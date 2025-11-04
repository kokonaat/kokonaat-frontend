import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { CalendarIcon, X } from 'lucide-react'

interface DateRangeSearchProps {
    onDateChange?: (from?: Date, to?: Date) => void
}

export default function DateRangeSearch({ onDateChange }: DateRangeSearchProps) {
    const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined)
    const [open, setOpen] = React.useState(false)

    const handleSelect = (range: DateRange | undefined) => {
        setDateRange(range)

        // Notify parent immediately when both dates are selected
        if (range?.from && range?.to) {
            onDateChange?.(range.from, range.to)
            // Close popover after both dates are selected
            setTimeout(() => setOpen(false), 100)
        }
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        setDateRange(undefined)
        onDateChange?.(undefined, undefined)
    }

    const formattedLabel =
        dateRange?.from && dateRange?.to
            ? `${format(dateRange.from, 'MMM dd, yyyy')} → ${format(dateRange.to, 'MMM dd, yyyy')}`
            : 'Select date range'

    return (
        <div className="flex items-center space-x-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="justify-start text-left font-normal min-w-[230px] h-8"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span className="truncate">{formattedLabel}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={handleSelect}
                        initialFocus
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            {dateRange?.from && dateRange?.to && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    title="Clear date range"
                    className="h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}