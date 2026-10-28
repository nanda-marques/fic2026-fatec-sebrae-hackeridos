interface ProvedorVideo {
  regex: RegExp;
  build: (correspondencia: RegExpMatchArray, url: string) => string;
}

const provedores: ProvedorVideo[] = [
  {
    regex:
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#/]|$)/i,
    build: (correspondencia) =>
      `https://www.youtube.com/embed/${correspondencia[1]}`,
  },
  {
    regex:
      /(?:https?:\/\/)?(?:www\.)?(?:player\.)?vimeo\.com\/(?:video\/)?(\d+)(?:[?&#/]|$)/i,
    build: (correspondencia) =>
      `https://player.vimeo.com/video/${correspondencia[1]}`,
  },
  {
    regex: /\.mp4(?:$|[?#])/i,
    build: (_correspondencia, url) => url,
  },
];

export function normalizarUrlVideo(url: string): string {
  const urlLimpa = url.trim();

  for (const provedor of provedores) {
    const correspondencia = urlLimpa.match(provedor.regex);
    if (correspondencia) {
      return provedor.build(correspondencia, urlLimpa);
    }
  }

  return urlLimpa;
}

export function extrairVideoInfo(
  url: string
): { type: "iframe" | "video"; src: string } {
  const src = normalizarUrlVideo(url);
  return {
    type: /\.mp4(?:$|[?#])/i.test(src) ? "video" : "iframe",
    src,
  };
}
