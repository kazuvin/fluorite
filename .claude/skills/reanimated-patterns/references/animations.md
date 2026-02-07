# アニメーション実装例

すべての例で `ANIMATION` 定数 (`constants/animation.ts`) を使用する。

## FadeIn / FadeOut

最も基本的なアニメーション。条件付きレンダリングの切り替えに使う。

```tsx
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { ANIMATION } from "../../constants/animation";

{visible && (
  <Animated.View
    entering={FadeIn.duration(ANIMATION.entering.duration).easing(ANIMATION.entering.easing)}
    exiting={FadeOut.duration(ANIMATION.exiting.duration).easing(ANIMATION.exiting.easing)}
  >
    <Text>コンテンツ</Text>
  </Animated.View>
)}
```

## Keyframe (カスタムアニメーション)

複数のプロパティを同時にアニメーションしたい場合。`easing` は各キーフレームポイントに指定する (0 以外)。

```tsx
import { Keyframe } from "react-native-reanimated";
import { ANIMATION } from "../../constants/animation";

// 右からスライドイン + フェードイン
const entering = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 20 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: ANIMATION.entering.easing },
}).duration(ANIMATION.entering.duration);

// 左へスライドアウト + フェードアウト
const exiting = new Keyframe({
  0: { opacity: 1, transform: [{ translateX: 0 }] },
  100: { opacity: 0, transform: [{ translateX: -20 }], easing: ANIMATION.exiting.easing },
}).duration(ANIMATION.exiting.duration);
```

**注意**: Keyframe の `easing` はキーフレームポイント (0, 50, 100 など) のオブジェクト内に書く。`.easing()` チェーンではない。

## LinearTransition (レイアウトアニメーション)

要素の位置・サイズがレイアウト変更で動く場合。`layout` prop に指定する。

```tsx
import Animated, { LinearTransition } from "react-native-reanimated";
import { ANIMATION } from "../../constants/animation";

<Animated.View layout={LinearTransition.duration(ANIMATION.layout.duration).easing(ANIMATION.layout.easing)}>
  {children}
</Animated.View>
```

## SlideInDown / SlideOutDown

ボトムシートやダイアログの表示・非表示に使う。

```tsx
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";
import { ANIMATION } from "../../constants/animation";

<Animated.View
  entering={SlideInDown.duration(ANIMATION.entering.duration).easing(ANIMATION.entering.easing)}
  exiting={SlideOutDown.duration(ANIMATION.exiting.duration).easing(ANIMATION.exiting.easing)}
>
  <DialogCard />
</Animated.View>
```

## 組み合わせパターン: モード切替

ヘッダーのタイトルをモードに応じて切り替える例。entering/exiting を組み合わせてクロスフェード + スライドを実現。

```tsx
import { ANIMATION } from "../../constants/animation";

const titleEntering = new Keyframe({
  0: { opacity: 0, transform: [{ translateX: 20 }] },
  100: { opacity: 1, transform: [{ translateX: 0 }], easing: ANIMATION.entering.easing },
}).duration(ANIMATION.entering.duration);

const titleExiting = new Keyframe({
  0: { opacity: 1, transform: [{ translateX: 0 }] },
  100: { opacity: 0, transform: [{ translateX: -20 }], easing: ANIMATION.exiting.easing },
}).duration(ANIMATION.exiting.duration);

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
import { ANIMATION } from "../../constants/animation";

{/* この要素は常に表示。子が消えると位置が変わるので layout で滑らかに移動 */}
<Animated.View layout={LinearTransition.duration(ANIMATION.layout.duration).easing(ANIMATION.layout.easing)}>
  <DateTrigger />
</Animated.View>

{/* 条件付きで表示/非表示。FadeIn/FadeOut で切り替え */}
{showCalendar && (
  <Animated.View
    entering={FadeIn.duration(ANIMATION.entering.duration).easing(ANIMATION.entering.easing)}
    exiting={FadeOut.duration(ANIMATION.exiting.duration).easing(ANIMATION.exiting.easing)}
  >
    <Calendar />
  </Animated.View>
)}
```
