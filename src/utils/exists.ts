type Falsy = 0 | -0 | 0n | '' | null | undefined | false;

export function exists<V>(value: V | Falsy): value is V {
  return !!value;
}
