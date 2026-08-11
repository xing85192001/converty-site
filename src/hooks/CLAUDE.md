# Hooks Directory

Custom React hooks for Converty.

## Available Hooks

### `useConverter`

Main hook for calculator state management with URL persistence.

```typescript
import { useConverter } from "@/hooks";

interface FormValues {
  amount: string;
  rate: string;
}

interface CalculationResult {
  total: number;
  interest: number;
}

const { values, setValue, result } = useConverter<FormValues, CalculationResult>({
  initialValues: {
    amount: "1000",
    rate: "5",
  },
  calculate: (vals) => {
    const amount = parseFloat(vals.amount) || 0;
    const rate = parseFloat(vals.rate) || 0;
    return {
      value: {
        total: amount * (1 + rate / 100),
        interest: amount * (rate / 100),
      },
    };
  },
});
```

#### Parameters

| Property | Type | Description |
|----------|------|-------------|
| `initialValues` | `T` | Default form values |
| `calculate` | `(values: T) => { value: R }` | Calculation function |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `values` | `T` | Current form values |
| `setValue` | `(key, value) => void` | Update a single value |
| `setValues` | `(values) => void` | Update multiple values |
| `result` | `{ value: R } \| null` | Calculation result |
| `reset` | `() => void` | Reset to initial values |

### `useUrlState`

Low-level hook for URL parameter synchronization.

```typescript
import { useUrlState } from "@/hooks";

const [state, setState] = useUrlState({
  amount: "1000",
  rate: "5",
});
```

## Migration Note

The project is transitioning from `useConverter` to **Zustand stores** for state management. New calculators may use Zustand patterns instead.

See `src/stores/` for the newer pattern.

## Usage Guidelines

1. **String values**: Store form values as strings, parse in calculate function
2. **Null handling**: `result` is null until first calculation
3. **Auto-calculate**: Calculations run automatically when values change
4. **URL sync**: Values are synced to URL for shareable links
