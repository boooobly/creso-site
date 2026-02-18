'use client';

import { useId, useRef } from 'react';

type FileUploadButtonProps = {
  accept?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  helperText?: string;
};

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function FileUploadButton({
  accept,
  value = null,
  onChange,
  helperText,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  return (
    <div className="space-y-2">
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-secondary rounded-lg px-4 py-2 text-sm"
        >
          Выбрать файл
        </button>

        {value ? (
          <>
            <span className="text-sm text-neutral-700 dark:text-neutral-200">{value.name} ({formatFileSize(value.size)})</span>
            <button
              type="button"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = '';
                onChange(null);
              }}
              className="text-xs font-medium text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              Удалить
            </button>
          </>
        ) : (
          <span className="text-sm text-neutral-500">Файл не выбран</span>
        )}
      </div>

      {helperText && <p className="text-xs text-neutral-500">{helperText}</p>}
    </div>
  );
}
