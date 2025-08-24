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
import { useCreateDesignation } from '@/hooks/useDesignation'
import { getCurrentShopId } from '@/lib/getCurrentShopId'

type TaskMutateDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: { id: string; title: string }
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
})
type TaskForm = z.infer<typeof formSchema>

const DesignationsMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: TaskMutateDrawerProps) => {
  const isUpdate = !!currentRow
  const shopId = getCurrentShopId()
  const createDesignation = useCreateDesignation(shopId || "")

  const form = useForm<TaskForm>({
    resolver: zodResolver(formSchema),
    defaultValues: currentRow ?? { title: "" },
  })

  const onSubmit = (data: TaskForm) => {
    if (!shopId) {
      console.error("Shop ID not found")
      return
    }

    createDesignation.mutate(
      { title: data.title, shop: shopId },
      {
        onSuccess: () => {
          onOpenChange(false)
          form.reset()
        },
      }
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        form.reset()
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
            id='tasks-form'
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
          <Button form='tasks-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default DesignationsMutateDrawer
