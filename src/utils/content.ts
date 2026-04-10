/**
 * Pre-processes Portable Text content to convert bare Spotify URL text blocks
 * into custom spotifyEmbed blocks that can be rendered as iframes.
 *
 * Handles the case where a Spotify URL is a plain unlinked text span.
 * (Linked Spotify URLs are handled by the SpotifyAwareLink mark component.)
 */

const SPOTIFY_URL_RE =
  // Modern: open.spotify.com/playlist/ID
  /^(https?:\/\/open\.spotify\.com\/(?:user\/[^/]+\/)?(playlist|track|album|episode|show)\/([A-Za-z0-9]+))/;

interface SpanChild {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface Block {
  _type: string;
  _key: string;
  style?: string;
  markDefs?: unknown[];
  children?: SpanChild[];
  [key: string]: unknown;
}

export function processContent(content: unknown[]): unknown[] {
  if (!Array.isArray(content)) return content;

  return content.map((block) => {
    const b = block as Block;

    // Only transform normal text blocks with no mark definitions
    if (
      b._type !== "block" ||
      b.style !== "normal" ||
      !Array.isArray(b.children) ||
      (b.markDefs?.length ?? 0) > 0
    ) {
      return block;
    }

    // Check if this block is a single span with no marks containing only a Spotify URL
    const children = b.children as SpanChild[];
    if (children.length !== 1) return block;

    const child = children[0];
    if (child._type !== "span" || child.marks?.length > 0) return block;

    const text = child.text?.trim() ?? "";
    const match = text.match(SPOTIFY_URL_RE);
    if (!match) return block;

    // Replace with a custom spotifyEmbed block
    const rawUrl = match[1];
    const resourceType = match[2];
    const resourceId = match[3];

    return {
      _type: "spotifyEmbed",
      _key: b._key,
      url: rawUrl,
      resourceType,
      resourceId,
    };
  });
}
