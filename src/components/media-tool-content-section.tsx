"use client";

import { ChevronDown } from "lucide-react";
import { useMessages, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type FaqItem = { q: string; a: string };

interface GuideData {
  steps?: string[];
  explanationTitle?: string;
  formula?: string;
  explanation?: string[];
  faq?: FaqItem[];
}

interface MediaToolMessages {
  [toolKey: string]: { guide?: GuideData } | undefined;
}

export function MediaToolContentSection({
  toolKey,
  toolName,
}: {
  toolKey: string;
  toolName: string;
}) {
  const t = useTranslations("guide");
  const messages = useMessages();

  const mediaTools = (messages as { mediaTools?: MediaToolMessages }).mediaTools;
  const guide = mediaTools?.[toolKey]?.guide;

  const steps = guide?.steps?.length
    ? guide.steps
    : [t("step1"), t("step2"), t("step3")];

  const faq: FaqItem[] = guide?.faq?.length
    ? guide.faq
    : [
        { q: t("fallbackQ1"), a: t("fallbackA1") },
        { q: t("fallbackQ2"), a: t("fallbackA2") },
        { q: t("fallbackQ3"), a: t("fallbackA3") },
      ];

  const explanationTitle = guide?.explanationTitle;
  const explanation = guide?.explanation?.length
    ? guide.explanation
    : [t("fallbackIntro", { name: toolName })];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Card className="mb-8 border-border">
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight">
            {t("howToUseTitle", { name: toolName })}
          </h2>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="mb-8 border-border">
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight">
            {explanationTitle ?? t("howItWorksTitle", { name: toolName })}
          </h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {guide?.formula ? (
            <div className="overflow-x-auto rounded-md border border-border bg-muted/50 px-3 py-2.5">
              <code className="whitespace-nowrap font-mono text-sm">
                {guide.formula}
              </code>
            </div>
          ) : null}

          {explanation.map((para) => (
            <p
              key={para}
              className="text-sm leading-relaxed text-muted-foreground"
            >
              {para}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-8 border-border">
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight">{t("faqTitle")}</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {faq.map((item) => (
            <details
              key={item.q}
              className="group rounded-lg border border-border px-3.5 py-2.5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium">
                <span>{item.q}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
