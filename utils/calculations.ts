
import { CartItem, IgvType, InvoiceTotals } from '../types';

export const calculateTotals = (items: CartItem[]): InvoiceTotals => {
  let gravada = 0, exonerada = 0, inafecta = 0, igv = 0;

  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    if (item.igvType === IgvType.GRAVADO) {
      const baseValue = itemTotal / 1.18;
      const itemIgv = itemTotal - baseValue;
      gravada += baseValue;
      igv += itemIgv;
    } else if (item.igvType === IgvType.EXONERADO) {
      exonerada += itemTotal;
    } else if (item.igvType === IgvType.INAFECTO) {
      inafecta += itemTotal;
    }
  });

  return { gravada, exonerada, inafecta, igv, total: gravada + igv + exonerada + inafecta };
};
