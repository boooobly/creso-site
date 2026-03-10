export type BagetPrintMaterial = 'paper' | 'canvas';
export type BagetTransferSource = 'manual' | 'wide-format';

export type BagetPrintRequirement = {
  requiresPrint: boolean;
  printMaterial: BagetPrintMaterial | null;
  transferSource: BagetTransferSource | null;
};

export function getInitialBagetPrintRequirement(transferSource: BagetTransferSource | null | undefined): BagetPrintRequirement {
  if (transferSource === 'wide-format') {
    return {
      requiresPrint: true,
      printMaterial: 'canvas',
      transferSource,
    };
  }

  return {
    requiresPrint: false,
    printMaterial: null,
    transferSource: transferSource ?? 'manual',
  };
}
