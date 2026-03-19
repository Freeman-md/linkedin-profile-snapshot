import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildProfileSnapshot,
  isProfileSnapshotRequest,
  PROFILE_SNAPSHOT_REQUEST_TYPE,
} from "../utils/profile-snapshot";

afterEach(() => {
  vi.useRealTimers();
});

describe("buildProfileSnapshot", () => {
  it("extracts visible profile content from LinkedIn-like markup", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-19T12:34:56.000Z"));

    const dom = new JSDOM(
      `<!doctype html>
      <html>
        <head>
          <title>Jane Doe | LinkedIn</title>
          <link rel="canonical" href="https://www.linkedin.com/in/jane-doe/" />
        </head>
        <body>
          <main>
            <section aria-label="profile header">
              <div>
                <h1>Jane Doe</h1>
              </div>
              <div>Principal Engineer at Example Ltd</div>
              <div>London, England, United Kingdom</div>
              <div>Open to work</div>
            </section>
            <section>
              <h2>About</h2>
              <p>Builds developer tools for distributed teams.</p>
              <p>Open to work</p>
            </section>
            <section>
              <h2>Activity</h2>
              <ul>
                <li>
                  <article>
                    <div>Posted about building internal tooling</div>
                    <div>2d</div>
                    <div>47 reactions</div>
                  </article>
                </li>
                <li>
                  <article>
                    <div>Commented on platform observability trends</div>
                    <div>5d</div>
                  </article>
                </li>
              </ul>
            </section>
            <section>
              <h2>Experience</h2>
              <ul>
                <li>
                  <article>
                    <div>Staff Engineer</div>
                    <div>Example Ltd</div>
                    <div>2022 - Present</div>
                    <div>London, United Kingdom</div>
                  </article>
                </li>
                <li>
                  <article>
                    <div>Senior Engineer</div>
                    <div>Acme Systems</div>
                    <div>2019 - 2022</div>
                  </article>
                </li>
              </ul>
            </section>
          </main>
        </body>
      </html>`,
      { url: "https://www.linkedin.com/in/jane-doe/details/experience/" },
    );
    installInnerTextFallback(dom.window.document);

    const snapshot = buildProfileSnapshot(
      dom.window.document,
      dom.window.location.href,
    );

    expect(snapshot.profileUrl).toBe("https://www.linkedin.com/in/jane-doe/");
    expect(snapshot.pageUrl).toBe(
      "https://www.linkedin.com/in/jane-doe/details/experience/",
    );
    expect(snapshot.pageTitle).toBe("Jane Doe | LinkedIn");
    expect(snapshot.capturedAt).toBe("2026-03-19T12:34:56.000Z");
    expect(snapshot.name).toBe("Jane Doe");
    expect(snapshot.headline).toBe("Principal Engineer at Example Ltd");
    expect(snapshot.location).toBe("London, England, United Kingdom");
    expect(snapshot.summary).toBe("Builds developer tools for distributed teams.");
    expect(snapshot.about).toBe("Builds developer tools for distributed teams.");
    expect(snapshot.recentActivity).toEqual([
      {
        title: "Posted about building internal tooling",
        details: ["2d", "47 reactions"],
      },
      {
        title: "Commented on platform observability trends",
        details: ["5d"],
      },
    ]);
    expect(snapshot.experiences).toEqual([
      {
        title: "Staff Engineer",
        details: ["Example Ltd", "2022 - Present", "London, United Kingdom"],
      },
      {
        title: "Senior Engineer",
        details: ["Acme Systems", "2019 - 2022"],
      },
    ]);
    expect(snapshot.topCardLines).toEqual([
      "Jane Doe",
      "Principal Engineer at Example Ltd",
      "London, England, United Kingdom",
      "Open to work",
    ]);
    expect(snapshot.sections).toEqual([
      {
        title: "About",
        items: ["Builds developer tools for distributed teams."],
      },
      {
        title: "Activity",
        items: [
          "Posted about building internal tooling",
          "2d",
          "47 reactions",
          "Commented on platform observability trends",
          "5d",
        ],
      },
      {
        title: "Experience",
        items: [
          "Staff Engineer",
          "Example Ltd",
          "2022 - Present",
          "London, United Kingdom",
          "Senior Engineer",
          "Acme Systems",
          "2019 - 2022",
        ],
      },
    ]);
  });

  it("normalizes the fallback profile URL when canonical metadata is absent", () => {
    const dom = new JSDOM(
      `<!doctype html>
      <html>
        <head>
          <title>Jane Doe | LinkedIn</title>
        </head>
        <body>
          <main>
            <section>
              <h1>Jane Doe</h1>
              <div>Product Designer</div>
            </section>
          </main>
        </body>
      </html>`,
      { url: "https://www.linkedin.com/in/jane-doe/details/skills/?trk=public_profile#contact-info" },
    );
    installInnerTextFallback(dom.window.document);

    const snapshot = buildProfileSnapshot(
      dom.window.document,
      dom.window.location.href,
    );

    expect(snapshot.profileUrl).toBe("https://www.linkedin.com/in/jane-doe/");
    expect(snapshot.about).toBe("");
    expect(snapshot.recentActivity).toEqual([]);
    expect(snapshot.experiences).toEqual([]);
  });

  it("prefers explicit top-card fields over CTA-like noise", () => {
    const dom = new JSDOM(
      `<!doctype html>
      <html>
        <head>
          <title>Jane Doe | LinkedIn</title>
        </head>
        <body>
          <main>
            <section aria-label="profile header">
              <div>
                <h1>Jane Doe</h1>
              </div>
              <div class="text-body-medium">500+ connections</div>
              <div class="text-body-medium break-words">Principal Engineer at Example Ltd</div>
              <div class="text-body-small inline">London, England, United Kingdom</div>
              <div>Follow</div>
            </section>
          </main>
        </body>
      </html>`,
      { url: "https://www.linkedin.com/in/jane-doe/" },
    );
    installInnerTextFallback(dom.window.document);

    const snapshot = buildProfileSnapshot(
      dom.window.document,
      dom.window.location.href,
    );

    expect(snapshot.headline).toBe("Principal Engineer at Example Ltd");
    expect(snapshot.location).toBe("London, England, United Kingdom");
  });
});

describe("isProfileSnapshotRequest", () => {
  it("accepts the expected request type and rejects everything else", () => {
    expect(
      isProfileSnapshotRequest({ type: PROFILE_SNAPSHOT_REQUEST_TYPE }),
    ).toBe(true);
    expect(isProfileSnapshotRequest({ type: "other-request" })).toBe(false);
    expect(isProfileSnapshotRequest(null)).toBe(false);
  });
});

function installInnerTextFallback(document: Document): void {
  const elements = [
    ...Array.from(document.querySelectorAll<HTMLElement>("*")),
    document.body,
    document.documentElement,
  ].filter((element): element is HTMLElement => Boolean(element));

  for (const element of elements) {
    Object.defineProperty(element, "innerText", {
      configurable: true,
      get(this: HTMLElement) {
        const children = Array.from(this.children);
        if (children.length === 0) {
          return this.textContent ?? "";
        }

        return children.map((child) => (child as HTMLElement).innerText).join("\n");
      },
      set(value: string) {
        this.textContent = value;
      },
    });
  }
}
