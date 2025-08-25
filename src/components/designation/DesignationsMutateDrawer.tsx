import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCreateDesignation, useUpdateDesignation } from '@/hooks/useDesignation'
import { getCurrentShopId } from '@/lib/getCurrentShopId'
import { useEffect } from 'react'
import { DesignationFormInterface, DesignationMutateDrawerProps } from '@/interface/designationInterface'
import { toast } from 'sonner'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
})

const DesignationsMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: DesignationMutateDrawerProps) => {
  const shopId = getCurrentShopId()
  const isUpdate = !!currentRow

  const createMutation = useCreateDesignation(shopId || '')
  const updateMutation = useUpdateDesignation(shopId || '')

  const form = useForm<DesignationFormInterface>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '' },
  })

  // Reset form values whenever currentRow changes
  useEffect(() => {
    form.reset(currentRow ?? { title: '' })
  }, [currentRow])

  const onSubmit = (data: DesignationFormInterface) => {
    if (!shopId) return

    if (isUpdate && currentRow) {
      // Update existing designation
      updateMutation.mutate(
        { id: currentRow.id, data },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
        }
      )
    } else {
      // Create new designation
      createMutation.mutate(
        { title: data.title, shop: shopId },
        {
          onSuccess: () => {
            onOpenChange(false)
            form.reset()
          },
          onError: (err: any) => {
            toast.error(err?.response?.data?.message)
          }
        }
      )
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset(currentRow ?? { title: '' })
      }}
    >
      <SheetContent className='flex flex-col'>
        <SheetHeader className='text-start'>
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Designation</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the designation by providing necessary info.'
              : 'Add a new designation by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='designation-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='title'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a title' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <SheetFooter className='gap-2'>
          <SheetClose asChild>
            <Button variant='outline'>Close</Button>
          </SheetClose>
          <Button form='designation-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default DesignationsMutateDrawer