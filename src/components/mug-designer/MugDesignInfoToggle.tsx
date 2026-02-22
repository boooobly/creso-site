'use client';


type ComplexityLevel = {
  title: string;
  description: string;
};

type Props = {
  complexityLevels: ComplexityLevel[];
  checklist: string[];
  needsDesign: boolean;
  onNeedsDesignChange: (value: boolean) => void;
};

export default function MugDesignInfoToggle({ complexityLevels, checklist, needsDesign, onNeedsDesignChange }: Props) {
  const onToggle = (checked: boolean) => {
    onNeedsDesignChange(checked);

    if (checked) {
      requestAnimationFrame(() => {
        document.getElementById('mug-design-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 shadow-sm">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={needsDesign}
            onChange={(event) => onToggle(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
          />
          <span>
            <span className="text-sm font-medium text-neutral-900">Нужен дизайн макета для кружки</span>
            <span className="text-xs text-neutral-600 mt-1 block">Если отметите, покажем варианты сложности и что входит в подготовку.</span>
          </span>
        </label>
      </div>

      <div
        id="mug-design-info"
        className={needsDesign
          ? 'mt-4 overflow-hidden transition-all duration-300 ease-out opacity-100 max-h-[2000px]'
          : 'mt-0 overflow-hidden transition-all duration-300 ease-out opacity-0 max-h-0 pointer-events-none'}
      >
        <h2 className="text-2xl font-semibold">Дизайн</h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">3 макета входит в стоимость.</p>

        <div>
          <h3 className="text-lg font-medium">Категории сложности I/II/III</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            {complexityLevels.map((level) => (
              <li key={level.title}><span className="font-semibold">{level.title}:</span> {level.description}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-medium">Чек-лист (+1 за каждый пункт)</h3>
          <ul className="mt-3 grid gap-2 text-sm text-neutral-700 dark:text-neutral-300 md:grid-cols-2">
            {checklist.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">Интерпретация: 0–2 → I, 3–5 → II, 6–8 → III.</p>
        </div>
      </div>
    </>
  );
}
