# @keegancodes/foundations-react

These are my shared React components I use in most apps

## Components

```ts
import { TailwindDebugger } from "@keegancodes/foundations-react/client";
```

Generally rendered conditionally for development only:

```tsx
{
  process.env.NODE_ENV === "development" ? <TailwindDebugger /> : null;
}
```

> Borrowed from [@ImSh4yy](https://twitter.com/ImSh4yy/status/1778221562606268669)

More docs coming soon
