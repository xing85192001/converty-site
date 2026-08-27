"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  analyzeSEO,
  generateRecommendations,
  SEO_BEST_PRACTICES,
  type SEOMetrics,
} from "@/lib/converters/web/seo-performance";

export function SEOAnalyzer() {
  const t = useTranslations("calculator.labels");
  const tResults = useTranslations("calculator.results");
  const [metrics, setMetrics] = useState<SEOMetrics>({
    titleLength: 55,
    descriptionLength: 155,
    h1Count: 1,
    imageCount: 5,
    imagesWithAlt: 4,
    wordCount: 850,
    linkCount: 15,
    externalLinks: 3,
    internalLinks: 12,
  });

  const score = analyzeSEO(metrics);
  const recommendations = generateRecommendations(metrics);

  const handleChange = (field: keyof SEOMetrics, value: string) => {
    setMetrics((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoTitleLength")}</label>
          <input
            type="number"
            value={metrics.titleLength}
            onChange={(e) => handleChange("titleLength", e.target.value)}
            min={0}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <p className="text-xs text-muted-foreground">{t("seoOptimalTitle")}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoDescriptionLength")}</label>
          <input
            type="number"
            value={metrics.descriptionLength}
            onChange={(e) => handleChange("descriptionLength", e.target.value)}
            min={0}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <p className="text-xs text-muted-foreground">{t("seoOptimalDescription")}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoH1Tags")}</label>
          <input
            type="number"
            value={metrics.h1Count}
            onChange={(e) => handleChange("h1Count", e.target.value)}
            min={0}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <p className="text-xs text-muted-foreground">{t("seoOptimalH1")}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoTotalImages")}</label>
          <input
            type="number"
            value={metrics.imageCount}
            onChange={(e) => handleChange("imageCount", e.target.value)}
            min={0}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoImagesWithAlt")}</label>
          <input
            type="number"
            value={metrics.imagesWithAlt}
            onChange={(e) => handleChange("imagesWithAlt", e.target.value)}
            min={0}
            max={metrics.imageCount}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoWordCount")}</label>
          <input
            type="number"
            value={metrics.wordCount}
            onChange={(e) => handleChange("wordCount", e.target.value)}
            min={0}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
          <p className="text-xs text-muted-foreground">{t("seoOptimalWords")}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoTotalLinks")}</label>
          <input
            type="number"
            value={metrics.linkCount}
            onChange={(e) => handleChange("linkCount", e.target.value)}
            min={0}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoInternalLinks")}</label>
          <input
            type="number"
            value={metrics.internalLinks}
            onChange={(e) => handleChange("internalLinks", e.target.value)}
            min={0}
            max={metrics.linkCount}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("seoExternalLinks")}</label>
          <input
            type="number"
            value={metrics.externalLinks}
            onChange={(e) => handleChange("externalLinks", e.target.value)}
            min={0}
            max={metrics.linkCount}
            className="w-full h-10 px-3 rounded-md border bg-background"
          />
        </div>
      </div>

      <div className="p-6 rounded-lg border bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground mb-2">{t("seoOverallScore")}</p>
        <p
          className={`text-5xl font-bold ${
            score.overall >= 80
              ? "text-green-600"
              : score.overall >= 60
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {score.overall}
        </p>
        <p className="text-sm text-muted-foreground mt-2">{t("seoOutOf100")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(score)
          .filter(([key]) => key !== "overall")
          .map(([key, value]) => (
            <div key={key} className="p-4 rounded-lg border bg-background">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium capitalize">{key}</span>
                <span
                  className={`text-lg font-bold ${
                    value.score >= 80
                      ? "text-green-600"
                      : value.score >= 60
                        ? "text-yellow-600"
                        : "text-red-600"
                  }`}
                >
                  {value.score}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{tResults(value.feedback)}</p>
            </div>
          ))}
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium">{t("seoRecommendations")}</p>
          {recommendations.map((rec) => (
            <div
              key={`${rec.category}-${rec.issue}`}
              className={`p-4 rounded-lg border ${
                rec.priority === "high"
                  ? "border-red-500/50 bg-red-500/10"
                  : rec.priority === "medium"
                    ? "border-yellow-500/50 bg-yellow-500/10"
                    : "border-blue-500/50 bg-blue-500/10"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    rec.priority === "high"
                      ? "bg-red-500/20 text-red-600"
                      : rec.priority === "medium"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-blue-500/20 text-blue-600"
                  }`}
                >
                  {t(`seoPriority${rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}`)}
                </span>
                <span className="font-medium">{tResults(rec.category)}</span>
              </div>
              <p className="text-sm text-muted-foreground">{tResults(rec.issue)}</p>
              <p className="text-sm mt-1">{tResults(rec.recommendation)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm font-medium">{t("seoBestPractices")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{t("seoElement")}</th>
                <th className="text-left py-2">{t("seoOptimal")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-muted">
                <td className="py-2">{tResults("seo_category_title")}</td>
                <td className="py-2 text-muted-foreground">
                  {tResults(SEO_BEST_PRACTICES.title.optimalLength)}
                </td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2">{tResults("seo_category_description")}</td>
                <td className="py-2 text-muted-foreground">
                  {tResults(SEO_BEST_PRACTICES.description.optimalLength)}
                </td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2">{tResults("seo_category_content")}</td>
                <td className="py-2 text-muted-foreground">
                  {tResults(SEO_BEST_PRACTICES.content.optimalWords)}
                </td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2">{tResults("seo_category_images")}</td>
                <td className="py-2 text-muted-foreground">
                  {tResults(SEO_BEST_PRACTICES.images.requirement)}
                </td>
              </tr>
              <tr className="border-b border-muted">
                <td className="py-2">{tResults("seo_category_headings")}</td>
                <td className="py-2 text-muted-foreground">
                  {tResults(SEO_BEST_PRACTICES.headings.requirement)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
