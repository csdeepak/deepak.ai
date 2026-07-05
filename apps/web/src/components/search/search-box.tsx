"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { InputHTMLAttributes } from "react";

/**
 * SearchBox — scaffold for the /search page skin (docs/04 §7: one FTS
 * index, four skins). Debounce (delay.search-debounce = 180ms) and
 * URL reflection (?q=) land with the search sprint.
 */
export function SearchBox(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search
        size={16}
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 text-faint"
      />
      <Input type="search" className="pl-9" {...props} />
    </div>
  );
}
