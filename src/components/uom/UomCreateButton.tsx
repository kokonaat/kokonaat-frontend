import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUom } from './uom-provider'

const UomCreateButton = () => {
  const { setOpen } = useUom()

  return (
    <div className='flex gap-2'>
      <Button className='space-x-1' onClick={() => setOpen('create')}>
        <span>Create</span> <Plus size={18} />
      </Button>
    </div>
  )
}

export default UomCreateButton