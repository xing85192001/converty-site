"use client";

import type Fuse from "fuse.js";
import { Calculator, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useDeferredValue, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { SearchDocument } from "@/lib/search/search-data";
import { getSearchInstance, search } from "@/lib/search/search-index";

export function GlobalSearch({ trigger = true }: { trigger?: boolean }) {
  const t = useTranslations("common.search");
  const locale = useLocale();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchDocument[]>([]);
  const [fuse, setFuse] = useState<Fuse<SearchDocument> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search query for smooth typing
  const deferredQuery = useDeferredValue(query);

  // Detect platform for keyboard shortcut hint
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Keyboard shortcut: Cmd+K (Mac) or Ctrl+K (Windows)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Allow opening the palette from anywhere (e.g. hero search input)
  useEffect(() => {
    const openSearch = () => setOpen(true);
    window.addEventListener("open-global-search", openSearch);
    return () => window.removeEventListener("open-global-search", openSearch);
  }, []);

  // Load search index when dialog opens (lazy loading)
  useEffect(() => {
    if (open && !fuse) {
      setIsLoading(true);
      getSearchInstance(locale)
        .then((instance) => {
          setFuse(instance);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Failed to load search index:", error);
          setIsLoading(false);
        });
    }
  }, [open, locale, fuse]);

  // Perform search when query changes
  useEffect(() => {
    if (fuse && deferredQuery) {
      setResults(search(deferredQuery, fuse));
    } else {
      setResults([]);
    }
  }, [deferredQuery, fuse]);

  // Handle result selection
  const handleSelect = useCallback(
    (doc: SearchDocument) => {
      router.push(`/${locale}${doc.href}`);
      setOpen(false);
      setQuery("");
    },
    [router, locale]
  );

  return (
    <>
      {trigger && (
        <Button
          variant="outline"
          className="group relative flex h-11 w-full items-center justify-start gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/60 hover:bg-accent/40 sm:w-[440px]"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">{t("placeholder")}</span>
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden h-6 -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
            {isMac ? (
              <>
                <span className="text-xs">⌘</span>K
              </>
            ) : (
              <>Ctrl K</>
            )}
          </kbd>
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg sm:max-w-[550px]">
          <Command
            shouldFilter={false}
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          >
            <CommandInput placeholder={t("placeholder")} value={query} onValueChange={setQuery} />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm">{t("loading")}</div>
              ) : (
                <>
                  <CommandEmpty>{t("noResults")}</CommandEmpty>
                  {results.length > 0 && (
                    <CommandGroup heading={t("calculators")}>
                      {results.map((doc) => (
                        <CommandItem
                          key={doc.id}
                          value={doc.id}
                          onSelect={() => handleSelect(doc)}
                          className="flex items-center gap-2"
                        >
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span>{doc.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {doc.categoryName}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
