export interface UomMeta {
  name?: string
  baseQuantity?: number | null
  baseUom?: { name?: string } | null
}

/** "5 pcs" — for the Conversion column in UOM table and combobox label suffix. */
export function fmtConversionTag(uom?: UomMeta | null): string | null {
  if (!uom?.baseQuantity || !uom.baseUom?.name) return null
  return `${uom.baseQuantity} ${uom.baseUom.name}`
}

/** "= 15 pcs" — the reactive hint below the quantity input in the transaction form. */
export function fmtConversionLine(qty: number, uom?: UomMeta | null): string | null {
  if (!uom?.baseQuantity || !uom.baseUom?.name || !qty) return null
  return `= ${Math.round(qty * uom.baseQuantity)} ${uom.baseUom.name}`
}

/** Raw total items — null when no conversion is defined. */
export function calcTotalItems(qty: number, uom?: UomMeta | null): number | null {
  if (!uom?.baseQuantity || !uom.baseUom) return null
  return Math.round(qty * uom.baseQuantity)
}
