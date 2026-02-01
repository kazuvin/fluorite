import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./button";
import { ButtonText } from "./button-text";

describe("ButtonText", () => {
	it("テキストを表示する", () => {
		render(
			<Button>
				<ButtonText>保存</ButtonText>
			</Button>,
		);
		expect(screen.getByText("保存")).toBeInTheDocument();
	});

	it("variant=primary のとき文字色が白になる", () => {
		render(
			<Button variant="primary">
				<ButtonText>保存</ButtonText>
			</Button>,
		);
		expect(screen.getByText("保存")).toHaveStyle({ color: "#fff" });
	});

	it("variant=secondary のとき文字色が白になる", () => {
		render(
			<Button variant="secondary">
				<ButtonText>保存</ButtonText>
			</Button>,
		);
		expect(screen.getByText("保存")).toHaveStyle({ color: "#fff" });
	});

	it("variant=outline のとき文字色が白ではない", () => {
		render(
			<Button variant="outline">
				<ButtonText>保存</ButtonText>
			</Button>,
		);
		const el = screen.getByText("保存");
		expect(el.style.color).not.toBe("#fff");
		expect(el.style.color).toBeTruthy();
	});

	it("variant=ghost のとき文字色が白ではない", () => {
		render(
			<Button variant="ghost">
				<ButtonText>保存</ButtonText>
			</Button>,
		);
		const el = screen.getByText("保存");
		expect(el.style.color).not.toBe("#fff");
		expect(el.style.color).toBeTruthy();
	});
});
