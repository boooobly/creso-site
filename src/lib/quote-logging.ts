type QuoteLogPayload = {
  calculatorType: 'print' | 'heat-transfer' | 'wide-format';
  inputParameters: unknown;
  calculatedPrice: number;
};

export function logQuoteGeneration(payload: QuoteLogPayload): void {
  const entry = {
    event: 'quote_generated',
    calculatorType: payload.calculatorType,
    inputParameters: payload.inputParameters,
    calculatedPrice: payload.calculatedPrice,
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(entry));
}
