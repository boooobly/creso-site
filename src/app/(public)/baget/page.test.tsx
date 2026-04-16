import { describe, it, expect, vi, beforeEach } from 'vitest';

const loadPublicBagetCatalogMock = vi.fn();
const getCachedBagetPageContentMapMock = vi.fn();
const getCachedBaguetteExtrasPricingConfigMock = vi.fn();
const saveLatestBagetPageLoadDiagnosticsMock = vi.fn();
const loggerInfoMock = vi.fn();
const loggerWarnMock = vi.fn();
const isWideFormatCanvasBagetTransferMock = vi.fn();

vi.mock('@/components/baget/BagetConfigurator', () => ({
  default: (props: unknown) => ({ type: 'BagetConfiguratorMock', props }),
}));

vi.mock('@/lib/baget/catalogSnapshot', () => ({
  loadPublicBagetCatalog: loadPublicBagetCatalogMock,
}));

vi.mock('@/lib/baget/pageData', () => ({
  getCachedBagetPageContentMap: getCachedBagetPageContentMapMock,
  getCachedBaguetteExtrasPricingConfig: getCachedBaguetteExtrasPricingConfigMock,
}));

vi.mock('@/lib/baget/pageLoadDiagnostics', () => ({
  saveLatestBagetPageLoadDiagnostics: saveLatestBagetPageLoadDiagnosticsMock,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: loggerInfoMock,
    warn: loggerWarnMock,
  },
}));

vi.mock('@/lib/baget/transfer', () => ({
  isWideFormatCanvasBagetTransfer: isWideFormatCanvasBagetTransferMock,
}));

describe('/baget page progressive rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isWideFormatCanvasBagetTransferMock.mockReturnValue(false);
    loadPublicBagetCatalogMock.mockResolvedValue({
      items: [{ id: 'item-1' }],
      source: 'snapshot',
      autoSyncedSnapshot: false,
      snapshotExists: true,
      snapshotSyncedAt: '2026-04-16T12:00:00.000Z',
    });
    getCachedBagetPageContentMapMock.mockResolvedValue(new Map());
    getCachedBaguetteExtrasPricingConfigMock.mockResolvedValue({ print: { paperPricePerM2: 10 } });
    saveLatestBagetPageLoadDiagnosticsMock.mockResolvedValue(undefined);
  });

  it('renders shell with Suspense fallback without invoking data loaders in page shell', async () => {
    const { default: BagetPage } = await import('./page');

    const element = await BagetPage({
      searchParams: Promise.resolve({ width: '120', height: '80', transferSource: 'manual' }),
    });

    const mainChildren = element.props.children.props.children;
    expect(mainChildren[0].props.children).toBe('Конфигуратор багета');
    expect(mainChildren[1].props.children).toContain('точный расчёт стоимости');

    const suspenseNode = mainChildren[2];
    expect(String(suspenseNode.type)).toContain('react.suspense');
    expect(suspenseNode.props.fallback.type.name).toBe('BagetConfiguratorSkeleton');

    expect(loadPublicBagetCatalogMock).not.toHaveBeenCalled();
    expect(getCachedBagetPageContentMapMock).not.toHaveBeenCalled();
    expect(getCachedBaguetteExtrasPricingConfigMock).not.toHaveBeenCalled();
  });

  it('loads async configurator data and forwards props to BagetConfigurator', async () => {
    const { BagetConfiguratorSection } = await import('./page');

    const element = await BagetConfiguratorSection({
      initialWidth: '150',
      initialHeight: '90',
      initialWorkType: 'stretchedCanvas',
      initialTransferSource: 'wide-format',
    });

    expect(loadPublicBagetCatalogMock).toHaveBeenCalledTimes(1);
    expect(getCachedBagetPageContentMapMock).toHaveBeenCalledTimes(1);
    expect(getCachedBaguetteExtrasPricingConfigMock).toHaveBeenCalledTimes(1);

    expect(element.props).toMatchObject({
      items: [{ id: 'item-1' }],
      initialWidth: '150',
      initialHeight: '90',
      initialWorkType: 'stretchedCanvas',
      initialTransferSource: 'wide-format',
      pricingConfig: { print: { paperPricePerM2: 10 } },
    });
    expect(loggerInfoMock).toHaveBeenCalledWith(
      'baget.page.load_diagnostics',
      expect.objectContaining({
        catalogSource: 'snapshot',
        autoSyncedSnapshot: false,
      })
    );
    expect(saveLatestBagetPageLoadDiagnosticsMock).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogSource: 'snapshot',
        bagetItemsCount: 1,
      })
    );
  });

  it('preserves wide-format transfer search params forwarding', async () => {
    isWideFormatCanvasBagetTransferMock.mockReturnValue(true);

    const { default: BagetPage } = await import('./page');
    const pageElement = await BagetPage({
      searchParams: Promise.resolve({ width: '200', height: '120', transferSource: 'canvas-transfer' }),
    });

    const suspenseNode = pageElement.props.children.props.children[2];
    const sectionNode = suspenseNode.props.children;

    expect(sectionNode.props).toMatchObject({
      initialWidth: '200',
      initialHeight: '120',
      initialWorkType: 'stretchedCanvas',
      initialTransferSource: 'wide-format',
    });
  });
});
