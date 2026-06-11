"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui-kit/input";
import { cn } from "@/lib/utils";

type UsCityInputProps = {
  id: string;
  name: string;
  stateCode: string;
  defaultValue?: string | null;
  value?: string;
  onValueChange?: (city: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
};

export function UsCityInput({
  id,
  name,
  stateCode,
  defaultValue,
  value: controlledValue,
  onValueChange,
  required,
  disabled,
  className,
}: UsCityInputProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  function updateValue(nextValue: string) {
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onValueChange?.(nextValue);
  }
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isControlled) {
      setUncontrolledValue(defaultValue ?? "");
    }
  }, [defaultValue, isControlled]);

  useEffect(() => {
    if (!stateCode || disabled) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/us-cities?state=${encodeURIComponent(stateCode)}&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { cities: string[] };
        setSuggestions(data.cities);
        setOpen(data.cities.length > 0);
        setActiveIndex(-1);
      } catch {
        // Ignore aborted requests.
      }
    }, 200);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [disabled, stateCode, value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(city: string) {
    updateValue(city);
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
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
      selectSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        name={name}
        value={value}
        required={required}
        disabled={disabled || !stateCode}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        placeholder={stateCode ? "Start typing your city" : "Select state first"}
        className={className}
        onChange={(event) => {
          updateValue(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            setOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
      />

      {open && suggestions.length > 0 ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-brand-border bg-white py-1 shadow-lg"
        >
          {suggestions.map((city, index) => (
            <li key={city} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm text-brand-text hover:bg-brand-background",
                  index === activeIndex && "bg-brand-background",
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSuggestion(city);
                }}
              >
                {city}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
