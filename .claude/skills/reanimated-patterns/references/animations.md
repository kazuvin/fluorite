# アニメーション実装例

## FadeIn / FadeOut

最も基本的なアニメーション。条件付きレンダリングの切り替えに使う。

```tsx
import Animated, { Easing, FadeIn, FadeOut } from "react-native-reanimated";

{visible && (
  <Animated.View
    entering={FadeIn.duration(100).easing(Easing.ease)}
    exiting={FadeOut.duration(80).easing(Easing.ease)}
  >
    <Text>コンテンツ</Text>
  </Animated.View>
)}
```

## Keyframe (カスタムアニメーション)

複数のプロパティを同時にアニメーションしたい場合。`easing` は各キーフレームポイントに指定する (0 以外)。

```tsx
import { Easing, Keyframe } from "react-native-reanimated";

// 右からスライドイン + フェードイン
const entering = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 20 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: Easing.ease },
}).duration(100);

// 左へスライドアウト + フェードアウト
const exiting = new Keyframe({
  0: { opacity: 1, transform: [{ translateX: 0 }] },
  100: { opacity: 0, transform: [{ translateX: -20 }], easing: Easing.ease },
}).duration(80);
```

**注意**: Keyframe の `easing` はキーフレームポイント (0, 50, 100 など) のオブジェクト内に書く。`.easing()` チェーンではない。

## LinearTransition (レイアウトアニメーション)

要素の位置・サイズがレイアウト変更で動く場合。`layout` prop に指定する。

```tsx
import Animated, { Easing, LinearTransition } from "react-native-reanimated";

<Animated.View layout={LinearTransition.duration(100).easing(Easing.ease)}>
  {children}
</Animated.View>
```

## SlideInDown / SlideOutDown

ボトムシートやダイアログの表示・非表示に使う。

```tsx
import Animated, { Easing, SlideInDown, SlideOutDown } from "react-native-reanimated";

<Animated.View
  entering={SlideInDown.duration(100).easing(Easing.ease)}
  exiting={SlideOutDown.duration(80).easing(Easing.ease)}
>
  <DialogCard />
</Animated.View>
```

## 組み合わせパターン: モード切替

ヘッダーのタイトルをモードに応じて切り替える例。entering/exiting を組み合わせてクロスフェード + スライドを実現。

```tsx
const titleEntering = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 20 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: Easing.ease },
}).duration(100);

const titleExiting = new Keyframe({
  0: { opacity: 1, transform: [{ translateX: 0 }] },
  100: { opacity: 0, transform: [{ translateX: -20 }], easing: Easing.ease },
}).duration(80);

// key を変えることで React が要素を入れ替え、entering/exiting が発火する
{isPickerMode ? (
  <Animated.View key="picker" entering={titleEntering} exiting={titleExiting}>
    <Text>ピッカーモード</Text>
  </Animated.View>
) : (
  <Animated.View key="normal" entering={titleEntering} exiting={titleExiting}>
    <Text>通常モード</Text>
  </Animated.View>
)}
```

**ポイント**: `key` を異なる値にすることで、React が別コンポーネントとして扱い、アンマウント → マウントのアニメーションが走る。

## 組み合わせパターン: 条件付きセクション + レイアウト遷移

一部のセクションが表示/非表示になるとき、残りの要素が滑らかに移動する。

```tsx
{/* この要素は常に表示。子が消えると位置が変わるので layout で滑らかに移動 */}
<Animated.View layout={LinearTransition.duration(100).easing(Easing.ease)}>
  <DateTrigger />
</Animated.View>

{/* 条件付きで表示/非表示。FadeIn/FadeOut で切り替え */}
{showCalendar && (
  <Animated.View
    entering={FadeIn.duration(100).easing(Easing.ease)}
    exiting={FadeOut.duration(80).easing(Easing.ease)}
  >
    <Calendar />
  </Animated.View>
)}
```
