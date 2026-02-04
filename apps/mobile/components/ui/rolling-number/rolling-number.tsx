import { memo } from "react";
import { StyleSheet, type TextStyle, View } from "react-native";
import { RollingDigit } from "./rolling-digit";

const DEFAULT_DURATION = 300;
const DEFAULT_CHAR_HEIGHT = 24;

export type RollingNumberProps = {
	value: string;
	direction: 1 | -1;
	style?: TextStyle;
	duration?: number;
	charHeight?: number;
};

export const RollingNumber = memo(function RollingNumber({
	value,
	direction,
	style,
	duration = DEFAULT_DURATION,
	charHeight = DEFAULT_CHAR_HEIGHT,
}: RollingNumberProps) {
	const chars = value.split("");
	const len = chars.length;

	return (
		<View style={styles.container}>
			{chars.map((char, index) => (
				<RollingDigit
					key={`r${len - 1 - index}`}
					char={char}
					direction={direction}
					style={style}
					duration={duration}
					charHeight={charHeight}
				/>
			))}
		</View>
	);
});

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
	},
});
