// SEO Performance Calculator

export interface SEOMetrics {
  titleLength: number;
  descriptionLength: number;
  h1Count: number;
  imageCount: number;
  imagesWithAlt: number;
  wordCount: number;
  linkCount: number;
  externalLinks: number;
  internalLinks: number;
}

export interface SEOScore {
  overall: number;
  title: { score: number; feedback: string };
  description: { score: number; feedback: string };
  headings: { score: number; feedback: string };
  images: { score: number; feedback: string };
  content: { score: number; feedback: string };
  links: { score: number; feedback: string };
}

export interface SEORecommendation {
  priority: "high" | "medium" | "low";
  category: string;
  issue: string;
  recommendation: string;
}

export function analyzeSEO(metrics: SEOMetrics): SEOScore {
  const scores: SEOScore = {
    overall: 0,
    title: { score: 0, feedback: "" },
    description: { score: 0, feedback: "" },
    headings: { score: 0, feedback: "" },
    images: { score: 0, feedback: "" },
    content: { score: 0, feedback: "" },
    links: { score: 0, feedback: "" },
  };

  // Title analysis (optimal: 50-60 characters)
  if (metrics.titleLength === 0) {
    scores.title = { score: 0, feedback: "seo_title_missing" };
  } else if (metrics.titleLength < 30) {
    scores.title = { score: 50, feedback: "seo_title_too_short" };
  } else if (metrics.titleLength > 60) {
    scores.title = { score: 70, feedback: "seo_title_too_long" };
  } else if (metrics.titleLength >= 50 && metrics.titleLength <= 60) {
    scores.title = { score: 100, feedback: "seo_title_optimal" };
  } else {
    scores.title = { score: 85, feedback: "seo_title_good" };
  }

  // Description analysis (optimal: 150-160 characters)
  if (metrics.descriptionLength === 0) {
    scores.description = { score: 0, feedback: "seo_description_missing" };
  } else if (metrics.descriptionLength < 120) {
    scores.description = { score: 50, feedback: "seo_description_too_short" };
  } else if (metrics.descriptionLength > 160) {
    scores.description = { score: 70, feedback: "seo_description_truncated" };
  } else if (metrics.descriptionLength >= 150 && metrics.descriptionLength <= 160) {
    scores.description = { score: 100, feedback: "seo_description_optimal" };
  } else {
    scores.description = { score: 85, feedback: "seo_description_good" };
  }

  // Headings analysis
  if (metrics.h1Count === 0) {
    scores.headings = { score: 0, feedback: "seo_h1_missing" };
  } else if (metrics.h1Count === 1) {
    scores.headings = { score: 100, feedback: "seo_h1_single" };
  } else {
    scores.headings = { score: 60, feedback: "seo_h1_multiple" };
  }

  // Images analysis
  if (metrics.imageCount === 0) {
    scores.images = { score: 50, feedback: "seo_images_none" };
  } else {
    const altRatio = metrics.imagesWithAlt / metrics.imageCount;
    if (altRatio === 1) {
      scores.images = { score: 100, feedback: "seo_images_all_alt" };
    } else if (altRatio >= 0.8) {
      scores.images = { score: 80, feedback: "seo_images_some_missing_alt" };
    } else {
      scores.images = { score: 40, feedback: "seo_images_many_missing_alt" };
    }
  }

  // Content analysis (optimal: 300+ words)
  if (metrics.wordCount < 100) {
    scores.content = { score: 30, feedback: "seo_content_thin" };
  } else if (metrics.wordCount < 300) {
    scores.content = { score: 60, feedback: "seo_content_short" };
  } else if (metrics.wordCount < 1000) {
    scores.content = { score: 85, feedback: "seo_content_good" };
  } else {
    scores.content = { score: 100, feedback: "seo_content_substantial" };
  }

  // Links analysis
  if (metrics.linkCount === 0) {
    scores.links = { score: 40, feedback: "seo_links_none" };
  } else {
    const internalRatio = metrics.internalLinks / metrics.linkCount;
    if (internalRatio >= 0.7) {
      scores.links = { score: 100, feedback: "seo_links_good_internal" };
    } else if (internalRatio >= 0.5) {
      scores.links = { score: 80, feedback: "seo_links_balanced" };
    } else {
      scores.links = { score: 60, feedback: "seo_links_more_internal" };
    }
  }

  // Calculate overall score
  const weights = {
    title: 0.2,
    description: 0.15,
    headings: 0.15,
    images: 0.15,
    content: 0.2,
    links: 0.15,
  };

  scores.overall = Math.round(
    scores.title.score * weights.title +
      scores.description.score * weights.description +
      scores.headings.score * weights.headings +
      scores.images.score * weights.images +
      scores.content.score * weights.content +
      scores.links.score * weights.links
  );

  return scores;
}

export function generateRecommendations(metrics: SEOMetrics): SEORecommendation[] {
  const recommendations: SEORecommendation[] = [];

  if (metrics.titleLength === 0) {
    recommendations.push({
      priority: "high",
      category: "seo_category_title",
      issue: "seo_issue_title_missing",
      recommendation: "seo_rec_title_add",
    });
  } else if (metrics.titleLength < 30 || metrics.titleLength > 60) {
    recommendations.push({
      priority: "medium",
      category: "seo_category_title",
      issue: "seo_issue_title_length",
      recommendation: "seo_rec_title_optimize",
    });
  }

  if (metrics.descriptionLength === 0) {
    recommendations.push({
      priority: "high",
      category: "seo_category_description",
      issue: "seo_issue_description_missing",
      recommendation: "seo_rec_description_add",
    });
  } else if (metrics.descriptionLength < 120 || metrics.descriptionLength > 160) {
    recommendations.push({
      priority: "medium",
      category: "seo_category_description",
      issue: "seo_issue_description_length",
      recommendation: "seo_rec_description_optimize",
    });
  }

  if (metrics.h1Count === 0) {
    recommendations.push({
      priority: "high",
      category: "seo_category_headings",
      issue: "seo_issue_h1_missing",
      recommendation: "seo_rec_h1_add",
    });
  } else if (metrics.h1Count > 1) {
    recommendations.push({
      priority: "medium",
      category: "seo_category_headings",
      issue: "seo_issue_h1_multiple",
      recommendation: "seo_rec_h1_single",
    });
  }

  if (metrics.imageCount > 0 && metrics.imagesWithAlt < metrics.imageCount) {
    recommendations.push({
      priority: "medium",
      category: "seo_category_images",
      issue: "seo_issue_images_missing_alt",
      recommendation: "seo_rec_images_add_alt",
    });
  }

  if (metrics.wordCount < 300) {
    recommendations.push({
      priority: "medium",
      category: "seo_category_content",
      issue: "seo_issue_content_thin",
      recommendation: "seo_rec_content_expand",
    });
  }

  if (metrics.linkCount > 0 && metrics.internalLinks < metrics.linkCount * 0.5) {
    recommendations.push({
      priority: "low",
      category: "seo_category_links",
      issue: "seo_issue_links_few_internal",
      recommendation: "seo_rec_links_add_internal",
    });
  }

  return recommendations.sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });
}

export const SEO_BEST_PRACTICES = {
  title: {
    minLength: 30,
    maxLength: 60,
    optimalLength: "seo_best_title_optimal",
  },
  description: {
    minLength: 120,
    maxLength: 160,
    optimalLength: "seo_best_description_optimal",
  },
  content: {
    minWords: 300,
    optimalWords: "seo_best_content_optimal",
  },
  images: {
    requirement: "seo_best_images_requirement",
  },
  headings: {
    requirement: "seo_best_headings_requirement",
  },
};
