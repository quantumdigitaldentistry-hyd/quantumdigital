import { Pressable, Text, type PressableProps } from 'react-native';

const variants = {
  primary: {
    container: 'bg-primary active:bg-primary-dark',
    label: 'text-white',
  },
  secondary: {
    container: 'border border-primary bg-transparent active:bg-primary/10',
    label: 'text-primary',
  },
} as const;

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: keyof typeof variants;
  className?: string;
};

export function Button({
  title,
  variant = 'primary',
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const styles = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={`min-h-12 items-center justify-center rounded-xl px-5 ${styles.container} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      {...rest}
    >
      <Text className={`text-base font-semibold ${styles.label}`}>{title}</Text>
    </Pressable>
  );
}
