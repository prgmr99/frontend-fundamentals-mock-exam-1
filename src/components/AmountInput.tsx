import { ComponentProps } from 'react';
import { TextField } from 'tosslib';

export interface AmountInputProps extends Omit<ComponentProps<typeof TextField>, 'value' | 'onChange'> {
  value?: number | null;
  onChange: (value: number) => void;
}

export function AmountInput({ value, onChange, ...props }: AmountInputProps) {
  return (
    <TextField
      suffix="원"
      value={value?.toLocaleString() ?? ''}
      onChange={e => onChange(Number(e.target.value.split(',').join('')))}
      {...props}
    />
  );
}
