/**
 * Moves misplaced posts into their correct collections:
 *   - Playlist / mixtape posts → music
 *   - "Show N: ..." radio show posts → radio
 *
 * Uses the EmDash CLI (npx emdash) internally.
 *
 * Run with DRY_RUN=1 to preview without making changes.
 */

import { execSync } from "child_process";

const EMDASH = "npx emdash";
const DRY_RUN = process.env.DRY_RUN === "1";

function run(cmd) {
  return execSync(`${EMDASH} ${cmd}`, {
    cwd: process.cwd(),
    env: { ...process.env },
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
  });
}

/**
 * Returns "music", "radio", or null (keep in posts).
 * Classification is based primarily on slug patterns observed from the full
 * post list, with title-based fallbacks.
 */
function classify(slug, title) {
  // ── Radio ──────────────────────────────────────────────────────────────
  if (/^show-\d+/.test(slug) || slug === "show-on-hold") return "radio";

  // ── Music (playlist / mixtape posts) ───────────────────────────────────
  if (
    // "N Songs [Month Year]" or "N Songs: Month Year" (most common)
    /\d+-songs-/.test(slug) ||
    // "Songs [Best of ...]" or "Songs [March 2017]"  (slug starts with songs-)
    /^songs-/.test(slug) ||
    // "Another N Songs [...]"
    /^another-\d+/.test(slug) ||
    // "April 2019 [75 Songs]"
    /^april-2019-75-songs/.test(slug) ||
    // "29 Songs for 29 Days"
    /^29-songs/.test(slug) ||
    // "I Can't Drive ... 55 (songs)"
    /cant-drive-55-songs/.test(slug) ||
    // "Seventy Five Songs"
    /^seventy-five-songs/.test(slug) ||
    // "N More Songs"
    /\d+-more-songs/.test(slug) ||
    // "N Tracks [...]" or "N Tracks [...]"
    /\d+-tracks/.test(slug) || /-tracks-/.test(slug) ||
    /^twoscore-tracks/.test(slug) || /^100-tracks/.test(slug) ||
    /^50-tracks/.test(slug) || /^175-tracks/.test(slug) ||
    /^30-tracks/.test(slug) || /^60-tracks/.test(slug) ||
    /^55-tracks/.test(slug) || /^75-tracks/.test(slug) ||
    /^150-tracks/.test(slug) ||
    // Specific short slugs for playlists without obvious patterns
    slug === "five-0" ||        // "Five-0! [December 2015]"
    slug === "october-2015" ||  // "65 Songs [October 2015]"
    slug === "january-2016" ||  // "[January 2016]"
    /^on-the-45/.test(slug) ||  // "On the 45 [November 2015]"
    /^rowwwr/.test(slug) ||
    /supermix/.test(slug) ||
    /mega-mix/.test(slug) ||
    /^spotify-series/.test(slug) ||
    /^3-hours-best-of/.test(slug) ||
    // Laurel's birthday mix series
    /^laurels?-b-day/.test(slug) ||
    // Shake That Thang mixes
    /^shake-that-thang/.test(slug) ||
    // "Chant avec une nouvelle langue" mixes
    /^chant-avec-une/.test(slug) ||
    // "Discs for Laurel" series
    /^discs-for-laurel/.test(slug) ||
    // Mixtapes for Laurel / Camille
    /^mixtapes?-(for-)?(laurel|camille)/.test(slug) ||
    // Cedar Dance Parties
    /^cedar-dance-parties/.test(slug) ||
    // Found mixtapes
    /^found-mixtape/.test(slug) ||
    // Annual / multi-month best-of music recaps
    /^best-of-2013-2012-tumblr/.test(slug) ||
    /^best-aprilmay-2014/.test(slug) ||
    /^best-of-april/.test(slug) ||
    /^24-hour-mega-mix/.test(slug) ||
    /^200-track/.test(slug) ||
    // Title-based fallbacks for edge cases
    /^\d+\s+songs?[\s:\[]/i.test(title) ||
    /^another\s+\d+\s+songs?/i.test(title) ||
    /\d+\s+more\s+songs?/i.test(title)
  ) return "music";

  return null; // keep in posts
}

// ── Fetch all posts (with pagination) ────────────────────────────────────
let allPosts = [];
let cursor = null;
do {
  const cursorFlag = cursor ? `--cursor "${cursor}"` : "";
  const raw = run(`content list posts --json --limit 100 ${cursorFlag}`);
  const page = JSON.parse(raw);
  allPosts = allPosts.concat(page.items);
  cursor = page.nextCursor ?? null;
} while (cursor);

console.log(`Found ${allPosts.length} posts total`);

const classified = allPosts.map((p) => ({ ...p, target: classify(p.slug, p.title) }));
const toMove   = classified.filter((p) => p.target !== null);
const toKeep   = classified.filter((p) => p.target === null);

console.log(`  → ${toMove.filter((p) => p.target === "music").length} → music`);
console.log(`  → ${toMove.filter((p) => p.target === "radio").length} → radio`);
console.log(`  → ${toKeep.length} staying in posts`);
if (DRY_RUN) {
  console.log("\n── DRY RUN — no changes made ──");
  console.log("\nWould move:");
  toMove.forEach((p) => console.log(`  [${p.target}] ${p.slug}\t${p.title}`));
  console.log("\nWould keep in posts:");
  toKeep.forEach((p) => console.log(`  [posts] ${p.slug}\t${p.title}`));
  process.exit(0);
}

console.log();

// ── Migrate ───────────────────────────────────────────────────────────────
let moved = 0;
let failed = 0;

for (const post of toMove) {
  try {
    // Get full post data (CLI auto-converts PT → markdown)
    const raw = run(`content get posts ${post.id} --json`);
    const full = JSON.parse(raw);
    const d = full.data ?? full;

    // Build data payload for target collection
    const payload = { title: d.title ?? post.title };
    if (d.excerpt) payload.excerpt = d.excerpt;
    if (d.content) payload.content = d.content;

    // Featured image — keep the full object (provider/id/src) as-is
    if (d.featured_image?.src) {
      payload.featured_image = d.featured_image;
    }

    // Radio-specific: extract episode number from title
    if (post.target === "radio") {
      const epMatch = post.title.match(/show\s+(\d+)/i);
      if (epMatch) payload.episode_number = parseInt(epMatch[1]);
    }

    const dataJson = JSON.stringify(payload).replace(/'/g, "'\\''");

    // Create in target collection (preserving original slug)
    run(`content create ${post.target} --slug "${post.slug}" --data '${dataJson}' --json`);

    // Remove from posts
    run(`content delete posts ${post.id}`);

    console.log(`✓ [${post.target}] ${post.title}`);
    moved++;
  } catch (err) {
    console.error(`✗ FAILED: ${post.title} (${post.id})`);
    console.error(`  ${err.message?.split("\n")[0]}`);
    if (err.stderr) console.error(`  ${String(err.stderr).split("\n")[0]}`);
    failed++;
  }
}

console.log();
console.log(`Done. Moved: ${moved}, Failed: ${failed}`);
