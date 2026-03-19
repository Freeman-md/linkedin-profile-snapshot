export const PROFILE_SNAPSHOT_REQUEST_TYPE = "linkedin-profile-snapshot/request";

export interface ProfileSection {
  title: string;
  items: string[];
}

export interface ProfileDetailBlock {
  title: string;
  details: string[];
}

export interface ProfileSnapshot {
  profileUrl: string;
  pageUrl: string;
  pageTitle: string;
  capturedAt: string;
  name: string;
  headline: string;
  location: string;
  summary: string;
  about: string;
  recentActivity: ProfileDetailBlock[];
  experiences: ProfileDetailBlock[];
  topCardLines: string[];
  sections: ProfileSection[];
}

export interface ProfileSnapshotRequest {
  type: typeof PROFILE_SNAPSHOT_REQUEST_TYPE;
}

export type ProfileSnapshotResponse =
  | { ok: true; snapshot: ProfileSnapshot }
  | { ok: false; error: string };

const MAX_SECTION_ITEMS = 8;
const MAX_SECTIONS = 8;
const MAX_DETAIL_BLOCKS = 6;
const MAX_DETAIL_LINES = 6;
const TOP_CARD_HEADLINE_SELECTORS = [
  ".pv-text-details__left-panel .text-body-medium",
  ".text-body-medium.break-words",
  ".text-body-medium",
];
const TOP_CARD_LOCATION_SELECTORS = [
  ".pv-text-details__left-panel .text-body-small",
  ".text-body-small.inline",
  ".text-body-small",
];

const SECTION_NOISE = new Set([
  "message",
  "connect",
  "more",
  "open to",
  "open to work",
  "follow",
  "following",
  "followers",
  "see all",
  "show all",
  "contact info",
]);

const SECTION_TITLES = new Set([
  "about",
  "activity",
  "experience",
  "education",
  "skills",
  "featured",
  "certifications",
  "licenses & certifications",
  "recommendations",
  "accomplishments",
  "interests",
]);

export function isProfileSnapshotRequest(
  value: unknown,
): value is ProfileSnapshotRequest {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as ProfileSnapshotRequest).type === PROFILE_SNAPSHOT_REQUEST_TYPE
  );
}

export function buildProfileSnapshot(
  doc: Document,
  pageUrl: string,
): ProfileSnapshot {
  const canonicalUrl = getCanonicalProfileUrl(doc, pageUrl);
  const mainRegion = doc.querySelector("main") ?? doc.body;
  const name = pickName(mainRegion) ?? "";
  const topCard = findTopCard(mainRegion, name);
  const topCardLines = extractVisibleLines(topCard ?? mainRegion);
  const derivedTopCard = deriveTopCardFields(topCard, topCardLines, name);
  const sections = extractSections(mainRegion);
  const aboutSection = findSection(mainRegion, "about");
  const activitySection = findSection(mainRegion, "activity");
  const experienceSection = findSection(mainRegion, "experience");
  const about = pickAbout(aboutSection, sections);
  const recentActivity = extractDetailBlocks(activitySection, "activity");
  const experiences = extractDetailBlocks(experienceSection, "experience");
  const summary = about || derivedTopCard.summary || "";

  return {
    profileUrl: canonicalUrl,
    pageUrl,
    pageTitle: cleanText(doc.title),
    capturedAt: new Date().toISOString(),
    name,
    headline: derivedTopCard.headline,
    location: derivedTopCard.location,
    summary,
    about,
    recentActivity,
    experiences,
    topCardLines,
    sections,
  };
}

function getCanonicalProfileUrl(doc: Document, pageUrl: string): string {
  const canonicalLink = doc.querySelector<HTMLLinkElement>(
    'link[rel="canonical"], meta[property="og:url"]',
  );

  const canonicalValue =
    canonicalLink?.getAttribute("href") ??
    canonicalLink?.getAttribute("content") ??
    "";

  if (isLikelyProfileUrl(canonicalValue)) {
    return normalizeProfileUrl(canonicalValue);
  }

  return normalizeProfileUrl(pageUrl);
}

function pickName(root: ParentNode): string | undefined {
  const heading = root.querySelector<HTMLElement>("h1");
  const text = heading ? cleanText(heading.innerText) : "";
  return text || undefined;
}

function findTopCard(root: ParentNode, name: string): HTMLElement | null {
  const heading = root.querySelector<HTMLElement>("h1");
  if (!heading) {
    return null;
  }

  const candidateSections = [
    heading.closest("section"),
    heading.closest("article"),
    heading.parentElement?.closest("section"),
    heading.parentElement?.closest("article"),
  ].filter(Boolean) as HTMLElement[];

  const nameLower = name.toLowerCase();
  for (const candidate of candidateSections) {
    const text = candidate.innerText.toLowerCase();
    if (text.includes(nameLower)) {
      return candidate;
    }
  }

  return candidateSections[0] ?? null;
}

function findSection(root: ParentNode, expectedTitle: string): HTMLElement | null {
  const normalizedExpectedTitle = expectedTitle.toLowerCase();

  for (const section of Array.from(root.querySelectorAll<HTMLElement>("section"))) {
    const title = getSectionTitle(section).toLowerCase();
    if (title === normalizedExpectedTitle) {
      return section;
    }
  }

  return null;
}

function extractSections(root: ParentNode): ProfileSection[] {
  const sections: ProfileSection[] = [];
  const seen = new Set<string>();

  for (const section of Array.from(root.querySelectorAll<HTMLElement>("section"))) {
    const title = getSectionTitle(section);
    if (!title) {
      continue;
    }

    const normalizedTitle = title.toLowerCase();
    if (!SECTION_TITLES.has(normalizedTitle)) {
      continue;
    }

    if (seen.has(normalizedTitle)) {
      continue;
    }

    const items = extractSectionItems(section, title);
    if (items.length === 0) {
      continue;
    }

    sections.push({ title, items });
    seen.add(normalizedTitle);

    if (sections.length >= MAX_SECTIONS) {
      break;
    }
  }

  return sections;
}

function getSectionTitle(section: HTMLElement): string {
  const heading =
    section.querySelector<HTMLElement>("h2") ??
    section.querySelector<HTMLElement>("[aria-level='2']");

  return heading ? cleanText(heading.innerText) : "";
}

function extractSectionItems(section: HTMLElement, title: string): string[] {
  const lines = extractVisibleLines(section);
  const titleLower = title.toLowerCase();

  return lines
    .filter((line) => {
      const normalized = line.toLowerCase();
      return normalized !== titleLower && !isNoiseLine(normalized);
    })
    .slice(0, MAX_SECTION_ITEMS);
}

function extractDetailBlocks(
  section: HTMLElement | null,
  sectionTitle: string,
): ProfileDetailBlock[] {
  if (!section) {
    return [];
  }

  const seen = new Set<string>();
  const result: ProfileDetailBlock[] = [];
  const titleLower = sectionTitle.toLowerCase();

  for (const candidate of getDetailCandidates(section)) {
    const lines = extractVisibleLines(candidate)
      .filter((line) => {
        const normalized = line.toLowerCase();
        return normalized !== titleLower && !isNoiseLine(normalized);
      })
      .slice(0, MAX_DETAIL_LINES);

    if (lines.length === 0) {
      continue;
    }

    const key = lines.join("\n").toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push({
      title: lines[0],
      details: lines.slice(1),
    });

    if (result.length >= MAX_DETAIL_BLOCKS) {
      return result;
    }
  }

  const fallbackItems = extractSectionItems(section, sectionTitle);
  if (result.length === 0 && fallbackItems.length > 0) {
    result.push({
      title: fallbackItems[0],
      details: fallbackItems.slice(1, MAX_DETAIL_LINES),
    });
  }

  return result;
}

function getDetailCandidates(section: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    section.querySelectorAll<HTMLElement>("li, article"),
  );

  return candidates.filter((candidate) => {
    if (!isVisibleElement(candidate)) {
      return false;
    }

    return !hasNestedDetailAncestor(candidate, section);
  });
}

function hasNestedDetailAncestor(
  element: HTMLElement,
  boundary: HTMLElement,
): boolean {
  let current = element.parentElement;

  while (current && current !== boundary) {
    if (current.matches("li, article")) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

function extractVisibleLines(root: ParentNode): string[] {
  const textSource =
    root instanceof HTMLElement ? root.innerText : (root.textContent ?? "");

  return compactLines(textSource.split("\n").map(cleanText));
}

function deriveTopCardFields(
  topCard: HTMLElement | null,
  lines: string[],
  name: string,
): {
  headline: string;
  location: string;
  summary: string;
} {
  const filtered = lines.filter((line) => {
    const normalized = line.toLowerCase();
    return (
      normalized !== name.toLowerCase() &&
      !isNoiseLine(normalized) &&
      normalized.length > 0
    );
  });

  const headline =
    pickBestEffortText(topCard, TOP_CARD_HEADLINE_SELECTORS, isLikelyHeadlineLine) ??
    filtered.find((line) => isLikelyHeadlineLine(line)) ??
    "";
  const location =
    pickBestEffortText(topCard, TOP_CARD_LOCATION_SELECTORS, isLikelyLocation) ??
    filtered.find((line) => line !== headline && isLikelyLocation(line)) ??
    "";
  const summary = filtered
    .filter((line) => line !== headline && line !== location)
    .slice(0, 3)
    .join(" · ");

  return { headline, location, summary };
}

function pickBestEffortText(
  root: ParentNode | null,
  selectors: string[],
  predicate: (value: string) => boolean,
): string | undefined {
  if (!root) {
    return undefined;
  }

  for (const selector of selectors) {
    for (const element of Array.from(root.querySelectorAll<HTMLElement>(selector))) {
      if (!isVisibleElement(element)) {
        continue;
      }

      const text = cleanText(element.innerText);
      if (text && predicate(text)) {
        return text;
      }
    }
  }

  return undefined;
}

function pickAbout(
  aboutSection: HTMLElement | null,
  sections: ProfileSection[],
): string {
  const detailBlocks = extractDetailBlocks(aboutSection, "about");
  if (detailBlocks.length > 0) {
    return detailBlocks
      .flatMap((block) => [block.title, ...block.details])
      .join("\n");
  }

  const fallbackSection = sections.find(
    (section) => section.title.toLowerCase() === "about",
  );

  return fallbackSection ? fallbackSection.items.join("\n") : "";
}

function isLikelyProfileUrl(value: string): boolean {
  return /linkedin\.com\/in\//i.test(value);
}

function normalizeProfileUrl(value: string): string {
  const cleaned = value.trim();
  if (!cleaned) {
    return cleaned;
  }

  const url = cleaned.startsWith("http") ? new URL(cleaned) : new URL(cleaned, "https://www.linkedin.com");
  url.hash = "";
  url.search = "";

  const path = url.pathname
    .split("/")
    .filter(Boolean)
    .slice(0, 2)
    .join("/");

  url.pathname = `/${path}${path ? "/" : ""}`;
  return url.toString();
}

function isNoiseLine(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  if (SECTION_NOISE.has(normalized)) {
    return true;
  }

  return /^(see more|show more|show all|see all|open to work|open to)$/i.test(
    normalized,
  );
}

function isLikelyHeadlineLine(value: string): boolean {
  if (isNoiseLine(value) || isLikelyLocation(value)) {
    return false;
  }

  return !/^(\d+\+?\s+)?(follower|followers|connection|connections|mutual connection|mutual connections)$/i.test(
    value,
  );
}

function isLikelyLocation(value: string): boolean {
  return /,/.test(value) || /\b(remote|united kingdom|united states|europe|london|england|canada|india|germany|france|netherlands|australia)\b/i.test(value);
}

function isVisibleElement(element: HTMLElement): boolean {
  if (element.hidden || element.closest("[aria-hidden='true']")) {
    return false;
  }

  const defaultView = element.ownerDocument.defaultView;
  if (!defaultView) {
    return true;
  }

  const style = defaultView.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden";
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function compactLines(lines: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const line of lines.map(cleanText)) {
    if (!line || seen.has(line.toLowerCase())) {
      continue;
    }

    seen.add(line.toLowerCase());
    result.push(line);
  }

  return result;
}
