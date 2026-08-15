import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { LoanItemInterface } from '@/interface/loanInterface'
import { useLoanContext } from './loan-provider'
import { useTranslation } from '@/hooks/useTranslation'

type Props<TData> = { row: Row<TData> }

export function LoanRowActions<TData>({ row }: Props<TData>) {
    const { t } = useTranslation('loans')
    const { setOpen, setCurrentRow } = useLoanContext()
    const loan = row.original as LoanItemInterface

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant='ghost'
                    onClick={(e) => e.stopPropagation()}
                    className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
                >
                    <DotsHorizontalIcon className='h-4 w-4' />
                    <span className='sr-only'>{t('rowActions.openMenu')}</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' className='w-44'>
                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(loan)
                        setOpen('pay')
                    }}
                >
                    {t('rowActions.payLoan')}
                    <DropdownMenuShortcut><Wallet size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(loan)
                        setOpen('update')
                    }}
                >
                    {t('rowActions.edit')}
                    <DropdownMenuShortcut><Pencil size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>

                <DropdownMenuItem
                    className='text-destructive focus:text-destructive'
                    onClick={(e) => {
                        e.stopPropagation()
                        setCurrentRow(loan)
                        setOpen('delete')
                    }}
                >
                    {t('rowActions.delete')}
                    <DropdownMenuShortcut><Trash2 size={16} /></DropdownMenuShortcut>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
