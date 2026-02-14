/** カレンダーグリッドで使用する共通定数 */

/** 1セルの高さ（月カレンダー・週カレンダー共通） */
export const CELL_HEIGHT = 80;

/** 月カレンダーのグリッド行数 */
export const GRID_ROWS = 6;

/** 月カレンダー全体の高さ */
export const MONTH_HEIGHT = CELL_HEIGHT * GRID_ROWS;

/** 週カレンダー全体の高さ */
export const WEEK_HEIGHT = CELL_HEIGHT;

/** FlatList スワイプの前後範囲 */
export const OFFSET_RANGE = 120;

/** FlatList の初期表示インデックス */
export const INITIAL_INDEX = OFFSET_RANGE;

/** イベントバーの最大表示スロット数 */
export const MAX_VISIBLE_SLOTS = 3;

/** イベントバーの高さ */
export const EVENT_BAR_HEIGHT = 14;

/** イベントバー間のギャップ */
export const EVENT_BAR_GAP = 1;

/** 曜日ラベル（日曜始まり） */
export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
