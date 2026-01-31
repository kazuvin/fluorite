# コンポーネントテストパターン

## 配置

```
components/ui/{name}/
├── {name}.tsx
├── {name}.test.tsx    ← 仕様書
└── index.ts
```

## テンプレート

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { ComponentName } from "./component-name";

/**
 * ComponentName 仕様
 *
 * 目的: [このコンポーネントが何をするか]
 * 用途: [主な使用ケース]
 */
describe("ComponentName", () => {
  describe("初期状態", () => {
    it("レンダリングされること", () => {
      render(<ComponentName />);
      expect(screen.getByText("...")).toBeOnTheScreen();
    });

    it("childrenが表示されること", () => {
      render(<ComponentName>テストコンテンツ</ComponentName>);
      expect(screen.getByText("テストコンテンツ")).toBeOnTheScreen();
    });
  });

  describe("Props", () => {
    it("variant propを適用すること", () => {
      render(<ComponentName variant="primary" testID="component" />);
      expect(screen.getByTestId("component")).toBeOnTheScreen();
    });

    it("disabled propで無効化されること", () => {
      render(<ComponentName disabled testID="component" />);
      expect(screen.getByTestId("component")).toBeDisabled();
    });
  });

  describe("ユーザー操作", () => {
    it("プレス時にonPressが呼ばれること", () => {
      const handlePress = vi.fn();

      render(<ComponentName onPress={handlePress}>プレス</ComponentName>);
      fireEvent.press(screen.getByText("プレス"));

      expect(handlePress).toHaveBeenCalledTimes(1);
    });

    it("無効時はonPressが呼ばれないこと", () => {
      const handlePress = vi.fn();

      render(<ComponentName onPress={handlePress} disabled>プレス</ComponentName>);
      fireEvent.press(screen.getByText("プレス"));

      expect(handlePress).not.toHaveBeenCalled();
    });
  });

  describe("アクセシビリティ", () => {
    it("accessibilityLabelを持つこと", () => {
      render(<ComponentName accessibilityLabel="ラベル" />);
      expect(screen.getByLabelText("ラベル")).toBeOnTheScreen();
    });

    it("accessibilityRoleが設定されていること", () => {
      render(<ComponentName accessibilityRole="button" testID="component" />);
      expect(screen.getByRole("button")).toBeOnTheScreen();
    });
  });

  describe("エッジケース", () => {
    it("長いテキストを処理すること", () => {
      const longText = "A".repeat(1000);
      render(<ComponentName>{longText}</ComponentName>);
      expect(screen.getByText(longText)).toBeOnTheScreen();
    });
  });
});
```

## パターン

### イベントハンドラー

```typescript
it("テキスト入力でonChangeTextが呼ばれること", () => {
  const handleChange = vi.fn();
  render(<Input onChangeText={handleChange} />);
  fireEvent.changeText(screen.getByTestId("input"), "hello");
  expect(handleChange).toHaveBeenCalledWith("hello");
});
```

### 条件付きレンダリング

```typescript
it("エラー時にメッセージを表示すること", () => {
  render(<Input error="必須項目です" />);
  expect(screen.getByText("必須項目です")).toBeOnTheScreen();
});

it("正常時はエラーを表示しないこと", () => {
  render(<Input />);
  expect(screen.queryByText("エラー")).not.toBeOnTheScreen();
});
```

### ローディング状態

```typescript
it("ローディング中はインジケーターを表示すること", () => {
  render(<Button loading>送信</Button>);
  expect(screen.getByTestId("loading-indicator")).toBeOnTheScreen();
});
```

### スクロールビュー

```typescript
it("スクロール時にonScrollが呼ばれること", () => {
  const handleScroll = vi.fn();
  render(<ListComponent onScroll={handleScroll} />);
  fireEvent.scroll(screen.getByTestId("scroll-view"), {
    nativeEvent: { contentOffset: { y: 100 } },
  });
  expect(handleScroll).toHaveBeenCalled();
});
```

## Web vs React Native API

| Web (@testing-library/react)        | RN (@testing-library/react-native)    |
| ------------------------------------ | -------------------------------------- |
| `screen.getByRole("button")`        | `screen.getByRole("button")`          |
| `toBeInTheDocument()`               | `toBeOnTheScreen()`                   |
| `fireEvent.click()`                 | `fireEvent.press()`                   |
| `userEvent.type()`                  | `fireEvent.changeText()`              |
| `screen.getByTestId()`              | `screen.getByTestId()`               |
| `className` / `toHaveClass()`       | `style` / `toHaveStyle()`            |
| `fireEvent.change()`                | `fireEvent.changeText()`              |
