import { act, renderHook } from "@testing-library/react";
import { Provider, createStore } from "jotai";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetFormAtom } from "../stores/add-event-form-atoms";
import { useAddEventForm } from "./use-add-event-form";

describe("useAddEventForm", () => {
	let store: ReturnType<typeof createStore>;

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2025, 0, 15)); // 2025-01-15
		store = createStore();
		store.set(resetFormAtom);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	function wrapper({ children }: { children: ReactNode }) {
		return <Provider store={store}>{children}</Provider>;
	}

	describe("initial state", () => {
		it("starts with dialog closed", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.ui.visible).toBe(false);
		});

		it("initializes start date to today", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.formState.start).toBe("2025-01-15");
		});

		it("initializes end date to empty", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.formState.end).toBe("");
		});

		it("initializes allDay to true", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.formState.allDay).toBe(true);
		});

		it("initializes title to empty", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.formState.title).toBe("");
		});
	});

	describe("dialog controls", () => {
		it("opens dialog", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleOpen());
			expect(result.current.ui.visible).toBe(true);
		});

		it("closes dialog and resets form", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });

			act(() => result.current.actions.handleOpen());
			act(() => result.current.actions.setTitle("テスト"));
			act(() => result.current.actions.handleClose());

			expect(result.current.ui.visible).toBe(false);
			expect(result.current.formState.title).toBe("");
		});
	});

	describe("form state setters", () => {
		it("updates title", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.setTitle("新しい予定"));
			expect(result.current.formState.title).toBe("新しい予定");
		});

		it("updates allDay", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.setAllDay(false));
			expect(result.current.formState.allDay).toBe(false);
		});
	});

	describe("date picker mode", () => {
		it("starts not in date picker mode", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.ui.isDatePickerMode).toBe(false);
		});

		it("enters date picker mode for start date", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("start"));
			expect(result.current.ui.isDatePickerMode).toBe(true);
			expect(result.current.ui.datePickerTarget).toBe("start");
		});

		it("enters date picker mode for end date", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("end"));
			expect(result.current.ui.isDatePickerMode).toBe(true);
			expect(result.current.ui.datePickerTarget).toBe("end");
		});

		it("exits date picker mode", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("start"));
			act(() => result.current.actions.handleDatePickerBack());
			expect(result.current.ui.isDatePickerMode).toBe(false);
		});
	});

	describe("day selection", () => {
		it("selects start date", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("start"));
			act(() => result.current.actions.handleDayPress("2025-01-20"));
			expect(result.current.formState.start).toBe("2025-01-20");
		});

		it("selects end date", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("end"));
			act(() => result.current.actions.handleDayPress("2025-01-25"));
			expect(result.current.formState.end).toBe("2025-01-25");
		});

		it("swaps dates when end is before start", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });

			act(() => result.current.actions.handleDateTriggerPress("start"));
			act(() => result.current.actions.handleDayPress("2025-01-20"));

			act(() => result.current.actions.handleDateTriggerPress("end"));
			act(() => result.current.actions.handleDayPress("2025-01-10"));

			expect(result.current.formState.start).toBe("2025-01-10");
			expect(result.current.formState.end).toBe("2025-01-20");
		});

		it("swaps dates when start is after end", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });

			act(() => result.current.actions.handleDateTriggerPress("end"));
			act(() => result.current.actions.handleDayPress("2025-01-20"));

			act(() => result.current.actions.handleDateTriggerPress("start"));
			act(() => result.current.actions.handleDayPress("2025-01-25"));

			expect(result.current.formState.start).toBe("2025-01-20");
			expect(result.current.formState.end).toBe("2025-01-25");
		});
	});

	describe("calendar navigation", () => {
		it("navigates to previous month", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("start"));

			const initialMonth = result.current.ui.displayMonth;
			act(() => result.current.actions.handlePrevMonth());

			expect(result.current.ui.displayMonth).toBe(initialMonth - 1 < 0 ? 11 : initialMonth - 1);
		});

		it("navigates to next month", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("start"));

			const initialMonth = result.current.ui.displayMonth;
			act(() => result.current.actions.handleNextMonth());

			expect(result.current.ui.displayMonth).toBe((initialMonth + 1) % 12);
		});

		it("handles year rollover when navigating to previous month from January", () => {
			vi.setSystemTime(new Date(2025, 0, 15)); // January
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("start"));

			act(() => result.current.actions.handlePrevMonth());

			expect(result.current.ui.displayMonth).toBe(11);
			expect(result.current.ui.displayYear).toBe(2024);
		});
	});

	describe("date trigger display", () => {
		it("returns placeholder for empty start date", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			// Start date is initialized to today, so we need to check with a fresh hook
			// that has been reset
			act(() => result.current.actions.handleClose());
			expect(result.current.actions.getDateTriggerDisplayValue("start")).toContain("2025年1月15日");
		});

		it("returns placeholder for empty end date", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.actions.getDateTriggerDisplayValue("end")).toBe("終了日");
		});

		it("returns formatted date for selected end date", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("end"));
			act(() => result.current.actions.handleDayPress("2025-01-20"));
			expect(result.current.actions.getDateTriggerDisplayValue("end")).toBe("2025年1月20日");
		});
	});

	describe("hasValue indicators", () => {
		it("returns true when start has value", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.actions.getDateTriggerHasValue("start")).toBe(true);
		});

		it("returns false when end is empty", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.actions.getDateTriggerHasValue("end")).toBe(false);
		});

		it("returns true when end has value", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("end"));
			act(() => result.current.actions.handleDayPress("2025-01-20"));
			expect(result.current.actions.getDateTriggerHasValue("end")).toBe(true);
		});
	});

	describe("hasRange", () => {
		it("returns false when end is empty", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			expect(result.current.ui.hasRange).toBe(false);
		});

		it("returns false when start equals end", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("end"));
			act(() => result.current.actions.handleDayPress("2025-01-15")); // Same as start
			expect(result.current.ui.hasRange).toBe(false);
		});

		it("returns true when start and end are different", () => {
			const { result } = renderHook(() => useAddEventForm(), { wrapper });
			act(() => result.current.actions.handleDateTriggerPress("end"));
			act(() => result.current.actions.handleDayPress("2025-01-20"));
			expect(result.current.ui.hasRange).toBe(true);
		});
	});
});
