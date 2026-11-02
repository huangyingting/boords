export function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateAssetSvgDataUrl(
  name: string,
  category: string,
  accent: string
): string {
  const safeName = escapeXml(name);
  const safeCat = escapeXml(category);
  let illustration = "";

  if (category === "Characters") {
    illustration = `
      <circle cx="200" cy="115" r="42" fill="${accent}" opacity="0.9"/>
      <circle cx="200" cy="108" r="26" fill="#F6F6F0"/>
      <path d="M142 250 C142 188 258 188 258 250 Z" fill="${accent}"/>
      <circle cx="190" cy="104" r="3" fill="#121212"/>
      <circle cx="210" cy="104" r="3" fill="#121212"/>
      <path d="M192 117 Q200 123 208 117" stroke="#121212" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `;
  } else if (category === "Locations") {
    illustration = `
      <rect x="60" y="60" width="280" height="170" rx="10" fill="${accent}" opacity="0.18" stroke="${accent}" stroke-width="2.5"/>
      <line x1="60" y1="190" x2="340" y2="190" stroke="${accent}" stroke-width="2.5"/>
      <rect x="95" y="95" width="75" height="95" fill="${accent}" opacity="0.45"/>
      <rect x="195" y="80" width="95" height="110" fill="${accent}" opacity="0.65"/>
      <circle cx="135" cy="78" r="10" fill="#F4BD64"/>
    `;
  } else {
    illustration = `
      <rect x="130" y="75" width="140" height="130" rx="18" fill="${accent}" opacity="0.85"/>
      <rect x="150" y="95" width="100" height="90" rx="10" fill="#F6F6F0" opacity="0.85"/>
      <circle cx="200" cy="140" r="18" fill="${accent}"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
    <rect width="400" height="300" fill="#ECECE6"/>
    ${illustration}
    <rect x="16" y="252" width="368" height="34" rx="8" fill="#FFFFFF" opacity="0.92"/>
    <text x="28" y="274" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#121212">@${safeName.toLowerCase()}</text>
    <text x="372" y="274" font-family="system-ui, sans-serif" font-size="12" font-weight="500" fill="#6E6D68" text-anchor="end">${safeCat}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateStoryboardFrameSvgDataUrl(options: {
  frameNumber: number;
  label?: string;
  actionText?: string;
  soundText?: string;
  stylePreset?: string;
  aspectRatio?: string;
}): string {
  const {
    frameNumber,
    label = "",
    actionText = "",
    soundText = "",
    stylePreset = "Sketch",
  } = options;

  const isColor = stylePreset.toLowerCase().includes("color") || stylePreset.toLowerCase().includes("cinema");
  const bg = isColor ? "#E8EEF2" : "#F6F6F0";
  const stroke = "#121212";
  const accent = isColor ? "#F4BD64" : "#D4D3CB";
  const headline = escapeXml((label || actionText || `Scene ${frameNumber}`).slice(0, 48));
  const subline = escapeXml((actionText || soundText || "Storyboard shot composition").slice(0, 68));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360">
    <rect width="640" height="360" fill="${bg}"/>
    <!-- Perspective composition guides -->
    <line x1="0" y1="260" x2="640" y2="260" stroke="${stroke}" stroke-width="2" stroke-dasharray="6,4" opacity="0.35"/>
    <line x1="320" y1="260" x2="80" y2="360" stroke="${stroke}" stroke-width="1.5" opacity="0.2"/>
    <line x1="320" y1="260" x2="560" y2="360" stroke="${stroke}" stroke-width="1.5" opacity="0.2"/>
    <!-- Background elements -->
    <rect x="70" y="60" width="180" height="200" rx="6" fill="${accent}" opacity="0.45" stroke="${stroke}" stroke-width="2"/>
    <rect x="410" y="85" width="150" height="175" rx="6" fill="${accent}" opacity="0.3" stroke="${stroke}" stroke-width="2"/>
    <!-- Character / Subject sketch in foreground -->
    <circle cx="320" cy="135" r="34" fill="#FFFFFF" stroke="${stroke}" stroke-width="3"/>
    <circle cx="310" cy="130" r="3" fill="${stroke}"/>
    <circle cx="330" cy="130" r="3" fill="${stroke}"/>
    <path d="M312 145 Q320 152 328 145" stroke="${stroke}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path d="M262 275 C262 195 378 195 378 275 Z" fill="${isColor ? "#F4BD64" : "#FFFFFF"}" stroke="${stroke}" stroke-width="3"/>
    <!-- Camera framing corners -->
    <path d="M24 44 L24 24 L44 24" stroke="${stroke}" stroke-width="2.5" fill="none"/>
    <path d="M616 44 L616 24 L596 24" stroke="${stroke}" stroke-width="2.5" fill="none"/>
    <path d="M24 316 L24 336 L44 336" stroke="${stroke}" stroke-width="2.5" fill="none"/>
    <path d="M616 316 L616 336 L596 336" stroke="${stroke}" stroke-width="2.5" fill="none"/>
    <!-- Caption bar -->
    <rect x="36" y="286" width="568" height="44" rx="8" fill="#FFFFFF" opacity="0.92" stroke="#E5E4DE" stroke-width="1.5"/>
    <text x="52" y="306" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#121212">FRAME ${frameNumber} · ${escapeXml(stylePreset.toUpperCase())}: ${headline}</text>
    <text x="52" y="322" font-family="system-ui, sans-serif" font-size="11.5" fill="#6E6D68">${subline}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateAssetIllustrationSvg(
  name: string,
  category: string,
  accent = "#F4BD64"
): string {
  const folderMap: Record<string, string> = {
    character: "Characters",
    location: "Locations",
    prop: "Props",
  };
  return generateAssetSvgDataUrl(
    name,
    folderMap[category.toLowerCase()] || category,
    accent
  );
}

export function generateFrameIllustrationSvg(params: {
  frameIndex: number;
  prompt: string;
  shotType?: string;
  style?: string;
  mentions?: string[];
}): string {
  return generateStoryboardFrameSvgDataUrl({
    frameNumber: params.frameIndex,
    label: params.shotType || "Medium Shot",
    actionText: params.prompt,
    soundText: (params.mentions || []).join(" "),
    stylePreset: params.style || "sketch",
  });
}
