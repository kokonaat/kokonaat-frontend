// import { useEffect } from 'react'
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
import { toast } from 'sonner'
import { useCreateDesignation, useUpdateDesignation } from '@/hooks/useDesignation'
import { getCurrentShopId } from '@/lib/getCurrentShopId'
import { DesignationMutateDrawerProps } from '@/interface/designationInterface'
import { CustomerFormInterface } from '@/interface/customerInterface'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
})

const CustomersMutateDrawer = ({
  open,
  onOpenChange,
  currentRow,
}: DesignationMutateDrawerProps) => {
  const shopId = getCurrentShopId()
  const isUpdate = !!currentRow

  const createMutation = useCreateDesignation(shopId || '')
  const updateMutation = useUpdateDesignation(shopId || '')

  const form = useForm<CustomerFormInterface>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', phone: '', address: '', city: '', country: '', isB2B: false, contactPerson: '', contactPersonPhone: '' },
  })

  // Reset form values whenever currentRow changes
  // useEffect(() => {
  //   form.reset(currentRow ?? { title: '' })
  // }, [currentRow])

  const onSubmit = (data: CustomerFormInterface) => {
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
          <SheetTitle>{isUpdate ? 'Update' : 'Create'} Customer</SheetTitle>
          <SheetDescription>
            {isUpdate
              ? 'Update the customer by providing necessary info.'
              : 'Add a new customer by providing necessary info.'}
            Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            id='customer-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex-1 space-y-6 overflow-y-auto px-4'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a name' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a phone' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='address'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a address' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a city' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a country' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isB2B'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>B2B</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a isB2B' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='contactPerson'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a contactPerson' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='contactPersonPhone'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Person Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder='Enter a contactPersonPhone' />
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
          <Button form='customer-form' type='submit'>
            Save changes
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default CustomersMutateDrawer