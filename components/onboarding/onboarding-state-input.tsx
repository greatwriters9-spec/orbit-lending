"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

import { US_STATES } from "@/lib/auth/us-states";
import { cn } from "@/lib/utils";

import { onboardingInputClassName } from "./onboarding-shell";

type OnboardingStateInputProps = {
  value: string;
  onChange: (stateCode: string) => void;
  id?: string;
  placeholder?: string;
};

function filterStates(query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return US_STATES;
  }

  const normalized = trimmed.toLowerCase();
  return US_STATES.filter(
    (state) =>
      state.code.toLowerCase().includes(normalized) ||
      state.name.toLowerCase().includes(normalized),
  );
}

function resolveStateCode(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const upper = trimmed.toUpperCase();
  const byCode = US_STATES.find((state) => state.code === upper);
  if (byCode) {
    return byCode.code;
  }

  const byName = US_STATES.find(
    (state) => state.name.toLowerCase() === trimmed.toLowerCase(),
  );
  return byName?.code ?? null;
}

export function OnboardingStateInput({
  value,
  onChange,
  id,
  placeholder = "Start typing a state",
}: OnboardingStateInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const match = US_STATES.find((state) => state.code === value);
    setInputValue(match?.name ?? value);
  }, [value]);

  const suggestions = useMemo(() => filterStates(inputValue), [inputValue]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectState(stateCode: string, stateName: string) {
    onChange(stateCode);
    setInputValue(stateName);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleBlur() {
    const resolved = resolveStateCode(inputValue);
    if (resolved) {
      const match = US_STATES.find((state) => state.code === resolved);
      if (match) {
        selectState(match.code, match.name);
        return;
      }
    }

    const match = US_STATES.find((state) => state.code === value);
    setInputValue(match?.name ?? value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) =>
        index <= 0 ? suggestions.length - 1 : index - 1,
      );
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const state = suggestions[activeIndex];
      selectState(state.code, state.name);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        id={id}
        type="text"
        value={inputValue}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={placeholder}
        className={onboardingInputClassName()}
        onChange={(event) => {
          setInputValue(event.target.value);
          setOpen(true);
          setActiveIndex(-1);

          const resolved = resolveStateCode(event.target.value);
          if (resolved) {
            onChange(resolved);
          }
        }}
        onFocus={() => {
          setOpen(true);
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-[#E5E7EB] bg-white py-1 shadow-lg"
        >
          {suggestions.map((state, index) => (
            <li key={state.code} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-[#F8FAFC]",
                  index === activeIndex && "bg-[#F8FAFC]",
                  value === state.code && "text-brand-blue",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectState(state.code, state.name);
                }}
              >
                <span className="font-medium text-brand-navy">{state.name}</span>
                <span className="text-xs font-semibold text-muted-foreground">
                  {state.code}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
