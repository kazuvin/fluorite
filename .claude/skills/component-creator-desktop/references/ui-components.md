# UI Component Catalog (Web / Tailwind + Radix UI)

## Style Patterns

```tsx
const baseStyles = "rounded-md transition-colors focus:ring-2 focus:outline-none";
const disabledStyles = "disabled:cursor-not-allowed disabled:opacity-50";

const variantStyles = {
  primary: "bg-foreground text-background hover:opacity-90",
  secondary: "bg-transparent text-foreground border border-foreground/20 hover:bg-foreground/5",
  ghost: "bg-transparent text-foreground hover:bg-foreground/10",
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
} as const;
```

## Radix UI Wrapper

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  size?: "sm" | "md" | "lg";
};

// forwardRef不要 (React 19)
export function DialogContent({ className, size = "md", children, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg",
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

const sizeStyles = {
  sm: "w-[400px]",
  md: "w-[500px]",
  lg: "w-[640px]",
} as const;
```

## Compound Components (shadcn style)

個別エクスポート採用（tree-shaking効率）:

```tsx
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";

// NOT: <Dialog.Trigger />
```

## Storybook

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "UI/ComponentName",
  component: ComponentName,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { variant: "default" } };
export const Primary: Story = { args: { variant: "primary" } };
export const Small: Story = { args: { size: "sm" } };
```

## Tests

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

describe("ComponentName", () => {
  it("renders correctly", () => {
    render(<ComponentName>Test</ComponentName>);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ComponentName onClick={onClick}>Test</ComponentName>);
    await user.click(screen.getByText("Test"));
    expect(onClick).toHaveBeenCalled();
  });

  it("merges custom className", () => {
    render(<ComponentName className="custom-class" data-testid="comp" />);
    expect(screen.getByTestId("comp")).toHaveClass("custom-class");
  });

  it("is accessible", () => {
    render(<ComponentName aria-label="Action button" />);
    expect(screen.getByLabelText("Action button")).toBeInTheDocument();
  });
});
```

## Web Testing Library API

| Action            | API                                           |
| ----------------- | --------------------------------------------- |
| Render            | `render(<Component />)`                       |
| Find by text      | `screen.getByText("text")`                    |
| Find by role      | `screen.getByRole("button")`                  |
| Find by label     | `screen.getByLabelText("label")`              |
| Find by testId    | `screen.getByTestId("id")`                    |
| Assert exists     | `toBeInTheDocument()`                          |
| Assert not exists | `not.toBeInTheDocument()`                      |
| Click             | `await user.click(element)`                    |
| Type              | `await user.type(element, "text")`             |
| Assert class      | `toHaveClass("class-name")`                    |
| Assert disabled   | `toBeDisabled()`                               |
| Assert focus      | `toHaveFocus()`                                |
