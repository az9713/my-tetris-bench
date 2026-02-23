'use client';

import { AVAILABLE_MODELS } from '@/ai/providers';

interface ModelSelectorProps {
  value: string;
  onChange: (modelId: string) => void;
  disabled?: boolean;
  borderColor?: string;
}

export default function ModelSelector({
  value,
  onChange,
  disabled = false,
  borderColor = '#e879f9',
}: ModelSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-2 py-1.5 text-xs font-pixel bg-gray-900 rounded border text-white disabled:opacity-50 cursor-pointer appearance-none"
      style={{
        borderColor,
        outline: 'none',
      }}
    >
      {AVAILABLE_MODELS.map((model) => (
        <option key={model.id} value={model.id}>
          {model.icon} {model.displayName}
        </option>
      ))}
    </select>
  );
}
