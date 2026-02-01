# テスト用モック設定

## vitest.setup.ts の reanimated モック

reanimated はネイティブモジュールに依存するため、jsdom テスト環境ではモックが必要。

```typescript
// vitest.setup.ts
vi.mock("react-native-reanimated", () => {
  const { View } = require("react-native-web");
  const Animated = {
    View,
    Text: View,
    createAnimatedComponent: (c: unknown) => c,
  };

  // duration(), easing() のチェーンを再帰的にサポート
  const chainable = () => {
    const obj: Record<string, unknown> = {};
    obj.duration = () => obj;
    obj.easing = () => obj;
    return obj;
  };

  // Easing モック: Easing.out(Easing.ease) のようなネストに対応
  const easingFn = () => 0;
  easingFn.out = () => easingFn;
  easingFn.in = () => easingFn;
  easingFn.inOut = () => easingFn;
  easingFn.ease = easingFn;

  return {
    default: Animated,
    Easing: {
      out: () => easingFn,
      in: () => easingFn,
      inOut: () => easingFn,
      ease: easingFn,
    },
    FadeIn: chainable(),
    FadeOut: chainable(),
    SlideInDown: chainable(),
    SlideOutDown: chainable(),
    LinearTransition: chainable(),
    Keyframe: class {
      duration() {
        return this;
      }
    },
    useAnimatedStyle: (fn: () => unknown) => fn(),
  };
});
```

## ポイント

### chainable パターン

`FadeIn.duration(100).easing(...)` のようなメソッドチェーンをモックするため、`chainable()` で自己参照するオブジェクトを返す。新しいチェーンメソッドが追加された場合はここに追加する。

### Keyframe の easing

Keyframe の `easing` はキーフレームオブジェクト内のプロパティなので、`Easing` オブジェクトがモジュールレベルで利用可能であれば動く。`Keyframe` クラス自体には `easing()` メソッドは不要。

### 新しいアニメーション追加時

新しいアニメーション型 (例: `SlideInRight`) を使う場合、モックに追加する:

```typescript
SlideInRight: chainable(),
```
