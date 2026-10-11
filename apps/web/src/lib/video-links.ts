/**
 * YouTube and Google Drive links for the gallery. Staff paste any common link form; only
 * the provider and the video ID are kept (the database checks the same ID patterns), and
 * the embed and thumbnail addresses are always built here from fixed templates.
 */
export type VideoProvider = 'youtube' | 'drive';
export type VideoRef = { provider: VideoProvider; id: string };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
const DRIVE_ID = /^[A-Za-z0-9_-]{20,100}$/;

export type ParsedLink = VideoRef | { error: string };

export function parseVideoLink(input: string): ParsedLink {
  const text = input.trim();
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`);
  } catch {
    return { error: 'Paste the full link, starting with https://' };
  }
  const host = url.hostname.replace(/^(www|m)\./, '');
  const parts = url.pathname.split('/').filter(Boolean);

  if (host === 'youtu.be' || host === 'youtube.com' || host === 'youtube-nocookie.com') {
    // youtu.be/ID, watch?v=ID, shorts/ID, embed/ID, live/ID
    const id =
      host === 'youtu.be'
        ? parts[0]
        : parts[0] === 'watch'
          ? url.searchParams.get('v')
          : ['shorts', 'embed', 'live', 'v'].includes(parts[0] ?? '')
            ? parts[1]
            : null;
    return id && YOUTUBE_ID.test(id)
      ? { provider: 'youtube', id }
      : { error: 'This YouTube link doesn’t point to a video. Open the video and copy its link.' };
  }

  if (host === 'drive.google.com' || host === 'docs.google.com') {
    if (parts.includes('folders')) {
      return { error: 'That’s a folder. Open the video or photo itself and copy its link.' };
    }
    // file/d/ID/view, open?id=ID, uc?id=ID
    const id = parts[0] === 'file' && parts[1] === 'd' ? parts[2] : url.searchParams.get('id');
    return id && DRIVE_ID.test(id)
      ? { provider: 'drive', id }
      : { error: 'This Google Drive link doesn’t point to a file. Use Share › Copy link.' };
  }

  return { error: 'Only YouTube and Google Drive links are supported.' };
}

/** The player to show in an iframe. */
export function embedUrl({ provider, id }: VideoRef) {
  return provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
    : `https://drive.google.com/file/d/${id}/preview`;
}

/** A still for the grid. Drive only serves it for files shared "Anyone with the link". */
export function thumbnailUrl({ provider, id }: VideoRef) {
  return provider === 'youtube'
    ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    : `https://drive.google.com/thumbnail?id=${id}&sz=w1280`;
}

export const providerLabel = (provider: VideoProvider) =>
  provider === 'youtube' ? 'YouTube' : 'Google Drive';
