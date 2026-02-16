type QuoteCalculatorType = 'print' | 'heat-transfer' | 'wide-format';

type QuoteLogPayload = {
  calculatorType: QuoteCalculatorType;
  inputParameters: Record<string, string | number | boolean>;
  calculatedPrice: number;
};

export function logQuoteGeneration(payload: QuoteLogPayload): void {
  console.log(JSON.stringify({
    calculatorType: payload.calculatorType,
    inputParameters: payload.inputParameters,
    calculatedPrice: payload.calculatedPrice,
    timestamp: new Date().toISOString(),
  }));
}
