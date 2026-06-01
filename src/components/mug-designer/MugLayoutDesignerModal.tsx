'use client';

import { ChangeEvent, Component, useCallback, useEffect, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Copy, ImagePlus, Layers, MoveDown, MoveUp, Trash2, Type, X } from 'lucide-react';
import { MUG_PRINT_AREA, MUG_STAGE, MugDesignerLayer, MugDesignerValue, MugImageLayer, MugTextLayer } from './types';
import type { MugDesignerStageHandle } from './MugDesignerStage';

type Props = { open: boolean; initialValue: MugDesignerValue | null; onClose: () => void; onApply: (value: MugDesignerValue) => void };
const imageTypes = new Set(['image/png', 'image/jpeg']);
const fonts = ['Arial', 'Inter', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New'];

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function serializedLayers(layers: MugDesignerLayer[]) {
  return layers.map((layer) => layer.type === 'image' ? { ...layer, dataUrl: undefined } : layer);
}

const MugDesignerStage = dynamic(() => import('./MugDesignerStage'), {
  ssr: false,
  loading: () => <div className="aspect-[16/9] w-full animate-pulse rounded-xl bg-neutral-100" aria-label="Загрузка рабочей области" />,
});

type StageBoundaryProps = {
  children: ReactNode;
  onError: () => void;
};

type StageBoundaryState = {
  hasError: boolean;
};

class StageBoundary extends Component<StageBoundaryProps, StageBoundaryState> {
  state: StageBoundaryState = { hasError: false };

  static getDerivedStateFromError(): StageBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Mug designer stage failed to render.', error, errorInfo);
    this.props.onError();
  }

  render() {
    return this.state.hasError ? (
      <div className="flex aspect-[16/9] items-center justify-center rounded-xl bg-neutral-100 p-6 text-center text-sm text-red-700">
        Рабочая область временно недоступна. Закройте конструктор и попробуйте открыть его снова.
      </div>
    ) : this.props.children;
  }
}

export default function MugLayoutDesignerModal({ open, initialValue, onClose, onApply }: Props) {
  const [layers, setLayers] = useState<MugDesignerLayer[]>([]);
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [showGuides, setShowGuides] = useState(true);
  const [error, setError] = useState('');
  const [baseImageError, setBaseImageError] = useState(false);
  const [saving, setSaving] = useState(false);
  const stageRef = useRef<MugDesignerStageHandle>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const selected = layers.find((item) => item.id === selectedId);

  useEffect(() => { if (open) { setLayers(initialValue?.layers ?? []); setSourceFiles(initialValue?.sourceFiles ?? []); setSelectedId(undefined); setError(''); setBaseImageError(false); } }, [open, initialValue]);
  useEffect(() => { if (!open) return; const old = document.body.style.overflow; document.body.style.overflow = 'hidden'; const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', key); return () => { document.body.style.overflow = old; window.removeEventListener('keydown', key); }; }, [open, onClose]);

  const patch = useCallback((id: string, value: Partial<MugDesignerLayer>) => setLayers((items) => items.map((item) => item.id === id ? { ...item, ...value } as MugDesignerLayer : item)), []);
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []); event.target.value = ''; setError('');
    if (files.some((file) => !imageTypes.has(file.type))) { setError('Разрешены только изображения PNG, JPG или JPEG.'); return; }
    if (files.some((file) => file.size > 5 * 1024 * 1024)) { setError('Размер каждого исходного изображения не должен превышать 5 МБ.'); return; }
    if (sourceFiles.length + files.length > 8) { setError('Можно добавить не более 8 исходных изображений.'); return; }
    try {
      const additions = await Promise.all(files.map(async (file, index) => { const dataUrl = await readFile(file); const image = await loadImage(dataUrl); const ratio = Math.min(1, 520 / image.width, 360 / image.height); return { id: uid(), type: 'image', name: `Изображение ${layers.filter((x) => x.type === 'image').length + index + 1}`, dataUrl, sourceFileName: file.name, x: 700 + index * 35, y: 360 + index * 30, width: image.width * ratio, height: image.height * ratio, scaleX: 1, scaleY: 1, rotation: 0 } satisfies MugImageLayer; }));
      setSourceFiles((items) => [...items, ...files]); setLayers((items) => [...items, ...additions]); setSelectedId(additions.at(-1)?.id);
    } catch { setError('Не удалось загрузить изображение. Попробуйте другой файл.'); }
  };
  const addText = () => { const count = layers.filter((x) => x.type === 'text').length + 1; const item: MugTextLayer = { id: uid(), type: 'text', name: `Текст ${count}`, text: 'Ваш текст', x: 760, y: 490, width: 420, scaleX: 1, scaleY: 1, rotation: 0, fontFamily: 'Arial', fontSize: 72, fontStyle: 'normal', fill: '#111111', align: 'center' }; setLayers((items) => [...items, item]); setSelectedId(item.id); };
  const remove = () => { if (!selectedId) return; setLayers((items) => items.filter((x) => x.id !== selectedId)); setSelectedId(undefined); };
  const duplicate = () => { if (!selected) return; const copy = { ...selected, id: uid(), name: `${selected.name} копия`, x: selected.x + 35, y: selected.y + 35 } as MugDesignerLayer; setLayers((items) => [...items, copy]); setSelectedId(copy.id); };
  const reorder = (front: boolean) => { if (!selectedId) return; setLayers((items) => { const item = items.find((x) => x.id === selectedId); return item ? front ? [...items.filter((x) => x.id !== selectedId), item] : [item, ...items.filter((x) => x.id !== selectedId)] : items; }); };
  const apply = async () => {
    if (!stageRef.current) {
      setError('Рабочая область еще загружается. Попробуйте еще раз через несколько секунд.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const { previewDataUrl, printLayoutDataUrl } = await stageRef.current.exportDesign();
      const designJson = JSON.stringify({ version: 1, stage: MUG_STAGE, printArea: MUG_PRINT_AREA, layers: serializedLayers(layers) }, null, 2);
      onApply({ previewDataUrl, printLayoutDataUrl, designJson, layers, sourceFiles });
    } catch {
      setError('Не удалось подготовить макет. Проверьте изображения и попробуйте еще раз.');
    } finally {
      setSaving(false);
    }
  };
  const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-left text-xs font-medium text-neutral-800 transition hover:border-red-300 hover:text-red-700 disabled:opacity-40';
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] overflow-y-auto bg-neutral-950/70 p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="mug-designer-title">
    <div className="mx-auto flex min-h-full max-w-[1600px] items-center"><div className="w-full rounded-3xl bg-neutral-50 p-3 shadow-2xl sm:p-5">
      <div className="flex items-start justify-between gap-4"><div><h2 id="mug-designer-title" className="text-xl font-semibold text-neutral-900 sm:text-2xl">Конструктор макета кружки</h2><p className="mt-1 text-sm text-neutral-600">Добавьте изображения и текст, затем расположите их внутри печатной зоны.</p></div><button type="button" onClick={onClose} aria-label="Закрыть конструктор" className="rounded-full p-2 text-neutral-600 hover:bg-neutral-200"><X /></button></div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 rounded-2xl border border-neutral-200 bg-white p-2 sm:p-4"><StageBoundary onError={() => setError('Рабочая область временно недоступна. Закройте конструктор и попробуйте открыть его снова.')}><MugDesignerStage ref={stageRef} layers={layers} selectedId={selectedId} showGuides={showGuides} onSelect={setSelectedId} onPatch={patch} onBaseImageError={setBaseImageError} /></StageBoundary>{baseImageError && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Не удалось загрузить изображение кружки. Вы можете продолжить работу с макетом или попробовать открыть конструктор позже.</p>}<p className="mt-2 text-xs text-neutral-500">Рабочая зона: 1486 × 628 px. Объекты за её пределами скрываются при экспорте.</p></div>
        <aside className="space-y-3">
          <section className="rounded-2xl border border-neutral-200 bg-white p-3"><h3 className="text-sm font-semibold text-neutral-900">Инструменты</h3><div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1"><button type="button" className={button} onClick={() => uploadRef.current?.click()}><ImagePlus size={16}/>Загрузить изображение</button><input ref={uploadRef} className="hidden" type="file" accept="image/png,image/jpeg,.png,.jpg,.jpeg" multiple onChange={upload}/><button type="button" className={button} onClick={addText}><Type size={16}/>Добавить текст</button><label className="flex items-center gap-2 text-xs text-neutral-700"><input type="checkbox" checked={showGuides} onChange={(e) => setShowGuides(e.target.checked)} />Показать направляющие</label></div>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</section>
          <section className="rounded-2xl border border-neutral-200 bg-white p-3"><h3 className="flex items-center gap-2 text-sm font-semibold"><Layers size={16}/>Слои</h3>{layers.length ? <div className="mt-2 max-h-36 space-y-1 overflow-y-auto">{[...layers].reverse().map((item) => <button type="button" key={item.id} onClick={() => setSelectedId(item.id)} className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs ${selectedId === item.id ? 'bg-red-50 text-red-700' : 'hover:bg-neutral-100'}`}>{item.name}</button>)}</div> : <p className="mt-2 text-xs text-neutral-500">Добавьте изображение или текст, чтобы собрать макет.</p>}</section>
          <section className="rounded-2xl border border-neutral-200 bg-white p-3"><h3 className="text-sm font-semibold">Настройки объекта</h3>{selected ? <div className="mt-3 space-y-2">{selected.type === 'text' && <><label className="block text-xs">Текст<textarea value={selected.text} onChange={(e) => patch(selected.id, { text: e.target.value })} className="mt-1 w-full rounded-lg border p-2" /></label><label className="block text-xs">Шрифт<select value={selected.fontFamily} onChange={(e) => patch(selected.id, { fontFamily: e.target.value })} className="mt-1 w-full rounded-lg border p-2">{fonts.map((font) => <option key={font}>{font}</option>)}</select></label><label className="block text-xs">Кегль<input type="number" min="8" max="400" value={selected.fontSize} onChange={(e) => patch(selected.id, { fontSize: Number(e.target.value) || 8 })} className="mt-1 w-full rounded-lg border p-2" /></label><div className="grid grid-cols-2 gap-2"><label className="text-xs"><input type="checkbox" checked={selected.fontStyle.includes('bold')} onChange={(e) => patch(selected.id, { fontStyle: `${e.target.checked ? 'bold' : ''} ${selected.fontStyle.includes('italic') ? 'italic' : ''}`.trim() || 'normal' })} /> Жирный</label><label className="text-xs"><input type="checkbox" checked={selected.fontStyle.includes('italic')} onChange={(e) => patch(selected.id, { fontStyle: `${selected.fontStyle.includes('bold') ? 'bold' : ''} ${e.target.checked ? 'italic' : ''}`.trim() || 'normal' })} /> Курсив</label></div><label className="flex items-center justify-between text-xs">Цвет<input type="color" value={selected.fill} onChange={(e) => patch(selected.id, { fill: e.target.value })} /></label><label className="block text-xs">Выравнивание<select value={selected.align} onChange={(e) => patch(selected.id, { align: e.target.value as MugTextLayer['align'] })} className="mt-1 w-full rounded-lg border p-2"><option value="left">left</option><option value="center">center</option><option value="right">right</option></select></label></>}
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1"><button type="button" className={button} onClick={duplicate}><Copy size={15}/>Дублировать</button><button type="button" className={button} onClick={remove}><Trash2 size={15}/>Удалить</button>{selected.type === 'image' && <><button type="button" className={button} onClick={() => patch(selected.id, { scaleX: -selected.scaleX })}>Отразить по горизонтали</button><button type="button" className={button} onClick={() => patch(selected.id, { scaleY: -selected.scaleY })}>Отразить по вертикали</button></>}<button type="button" className={button} onClick={() => reorder(true)}><MoveUp size={15}/>На передний план</button><button type="button" className={button} onClick={() => reorder(false)}><MoveDown size={15}/>На задний план</button></div></div> : <p className="mt-2 text-xs text-neutral-500">Выберите объект на макете для настройки.</p>}</section>
        </aside>
      </div><div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold">Закрыть</button><button type="button" disabled={saving} onClick={apply} className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">{saving ? 'Подготовка…' : 'Применить макет'}</button></div>
    </div></div>
  </div>;
}
