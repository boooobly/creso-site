'use client';

import { ReactNode, useRef, useState } from 'react';

type ImageDropzoneProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
  title?: string;
  description?: string;
  buttonText?: string;
  helperText?: string;
  className?: string;
  helperTextClassName?: string;
  icon?: ReactNode;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
  invalidTypeMessage?: string;
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
  className = '',
  helperTextClassName = 'mt-1 text-xs text-neutral-500',
  icon,
  allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/tiff'],
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'],
  invalidTypeMessage = 'Можно загрузить только изображения JPG, PNG, WEBP или TIFF.',
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File | null) => {
    if (!file) {
      setError('');
      onChange(null);
      return;
    }

    const extension = file.name.includes('.') ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}` : '';
    const isMimeAllowed = Boolean(file.type) && allowedMimeTypes.includes(file.type.toLowerCase());
    const isExtensionAllowed = Boolean(extension) && allowedExtensions.includes(extension);

    if (!isMimeAllowed && !isExtensionAllowed) {
      setError(invalidTypeMessage);
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
      className={`min-h-[120px] rounded-xl border-2 border-dashed p-3 transition-colors md:p-4 ${isDragging ? 'border-red-500 bg-red-50/60 dark:bg-red-950/20' : 'border-neutral-300 bg-neutral-50/70 dark:border-neutral-700 dark:bg-neutral-900/50'} ${className}`.trim()}
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

      <div className="flex min-h-[120px] flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-sm font-medium">{title}</p>
          </div>
          <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">{description}</p>
        </div>

        <div className="ml-auto flex w-full flex-col items-end gap-2 sm:w-auto sm:min-w-[220px]">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary w-full rounded-lg px-4 py-2 text-sm sm:w-auto"
          >
            {buttonText}
          </button>
          {!value && <span className="mt-1 text-right text-xs text-neutral-500">Файл не выбран</span>}
          {value && (
            <div className="mt-1 text-right">
              <p className="max-w-[200px] truncate text-xs font-medium">{value.name}</p>
              <p className="text-xs text-neutral-500">{formatFileSize(value.size)}</p>
            </div>
          )}
        </div>
      </div>

      {value && (
        <button
          type="button"
          onClick={() => {
            if (fileInputRef.current) fileInputRef.current.value = '';
            validateAndSetFile(null);
          }}
          className="mt-2 text-xs font-medium text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Удалить
        </button>
      )}

      <p className={helperTextClassName}>{helperText}</p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
