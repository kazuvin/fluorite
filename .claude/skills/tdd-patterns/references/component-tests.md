# コンポーネントテストパターン (React Native)

## テストファイルの配置

```
components/ui/{name}/
├── {name}.tsx
├── {name}.test.tsx    ← 仕様書
└── index.ts
```

## 仕様テンプレート

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
  // ===========================================
  // 初期状態
  // ===========================================
  describe("初期状態", () => {
    it("クラッシュせずにレンダリングされること", () => {
      render(<ComponentName />);
      expect(screen.getByText("...")).toBeOnTheScreen();
    });

    it("childrenが正しくレンダリングされること", () => {
      render(<ComponentName>テストコンテンツ</ComponentName>);
      expect(screen.getByText("テストコンテンツ")).toBeOnTheScreen();
    });
  });

  // ===========================================
  // Props（API仕様）
  // ===========================================
  describe("Props", () => {
    describe("variant prop", () => {
      it("'primary'バリアントでレンダリングされること", () => {
        render(<ComponentName variant="primary" testID="component" />);
        expect(screen.getByTestId("component")).toBeOnTheScreen();
      });
    });

    describe("disabled prop", () => {
      it("disabled=trueのとき無効化されること", () => {
        render(<ComponentName disabled testID="component" />);
        expect(screen.getByTestId("component")).toBeDisabled();
      });
    });
  });

  // ===========================================
  // ユーザー操作
  // ===========================================
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

  // ===========================================
  // アクセシビリティ
  // ===========================================
  describe("アクセシビリティ", () => {
    it("正しいaccessibilityLabelを持つこと", () => {
      render(<ComponentName accessibilityLabel="アクセシブルラベル" />);
      expect(screen.getByLabelText("アクセシブルラベル")).toBeOnTheScreen();
    });

    it("accessibilityRoleが設定されていること", () => {
      render(<ComponentName accessibilityRole="button" testID="component" />);
      expect(screen.getByRole("button")).toBeOnTheScreen();
    });
  });

  // ===========================================
  // エッジケース
  // ===========================================
  describe("エッジケース", () => {
    it("非常に長いテキストを処理すること", () => {
      const longText = "A".repeat(1000);
      render(<ComponentName>{longText}</ComponentName>);
      expect(screen.getByText(longText)).toBeOnTheScreen();
    });

    it("カスタムstyleが適用されること", () => {
      render(<ComponentName style={{ marginTop: 20 }} testID="component" />);
      expect(screen.getByTestId("component")).toBeOnTheScreen();
    });
  });
});
```

## テストパターン

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
it("バリデーション失敗時にエラーメッセージを表示すること", () => {
  render(<Input error="この項目は必須です" />);
  expect(screen.getByText("この項目は必須です")).toBeOnTheScreen();
});

it("有効な場合はエラーを表示しないこと", () => {
  render(<Input />);
  expect(screen.queryByText("エラー")).not.toBeOnTheScreen();
});
```

### ローディング状態

```typescript
it("ローディング中はActivityIndicatorを表示すること", () => {
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

## 注意: React Native Testing Library の API

| Web (@testing-library/react)        | RN (@testing-library/react-native)    |
| ------------------------------------ | -------------------------------------- |
| `screen.getByRole("button")`        | `screen.getByRole("button")`          |
| `toBeInTheDocument()`               | `toBeOnTheScreen()`                   |
| `fireEvent.click()`                 | `fireEvent.press()`                   |
| `userEvent.type()`                  | `fireEvent.changeText()`              |
| `screen.getByTestId()`              | `screen.getByTestId()`               |
| `className` / `toHaveClass()`       | `style` / `toHaveStyle()`            |
| `fireEvent.change()`                | `fireEvent.changeText()`              |
