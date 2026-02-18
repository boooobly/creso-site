'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type ImageDropzoneProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  title?: string;
  description?: string;
  buttonText?: string;
  helperText?: string;
};

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
}

export default function ImageDropzone({
  value = null,
  onChange,
  accept = 'image/*',
  maxSizeMb = 50,
  title = 'Файлы макета',
  description = 'Перетащите файл сюда или загрузите вручную.',
  buttonText = 'Загрузить макет',
  helperText = 'JPG, PNG, WEBP, TIFF. До 50 МБ.',
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(() => {
    if (!value || !value.type.startsWith('image/')) return '';
    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      setError('');
      onChange(null);
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Можно загрузить только изображение.');
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`Размер файла не должен превышать ${maxSizeMb} МБ.`);
      return;
    }

    setError('');
    onChange(file);
  };

  return (
    <div
      className={`rounded-xl border-2 border-dashed p-4 transition-colors ${isDragging ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20' : 'border-neutral-300 bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-900/50'}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        validateAndSetFile(event.dataTransfer.files?.[0] ?? null);
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => validateAndSetFile(event.target.files?.[0] ?? null)}
      />

      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn-secondary rounded-lg px-4 py-2 text-sm"
        >
          {buttonText}
        </button>
        {!value && <span className="text-sm text-neutral-500">Файл не выбран</span>}
      </div>

      {value && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Предпросмотр макета"
              className="h-20 w-20 rounded-md object-cover"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{value.name}</p>
            <p className="text-xs text-neutral-500">{formatFileSize(value.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.value = '';
              validateAndSetFile(null);
            }}
            className="text-xs font-medium text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Удалить
          </button>
        </div>
      )}

      <p className="mt-3 text-xs text-neutral-500">{helperText}</p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
