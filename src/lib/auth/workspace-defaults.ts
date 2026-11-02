import { prisma } from "@/lib/prisma";
import { generateAssetSvgDataUrl } from "@/lib/svg-generator";

export function generateShortHash(length = 7): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function slugifyWithHash(name: string): { shortSlug: string; slug: string } {
  const shortSlug = generateShortHash(6).toLowerCase();
  const clean = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
  return {
    shortSlug,
    slug: `${shortSlug}-${clean}`,
  };
}

/**
 * Initializes default Boords workflow statuses, storyboard templates, and
 * standard asset library categories when a real user creates a new workspace team.
 * Does NOT create any dummy users or fake accounts.
 */
export async function initializeTeamDefaults(teamId: string) {
  const defaultStatuses = [
    {
      name: "Draft",
      category: "draft",
      color: "#9CA3AF",
      description: "Initial work in progress",
      position: 0,
      isDefault: true,
    },
    {
      name: "In progress",
      category: "in_progress",
      color: "#3B82F6",
      description: "Actively being boarded or scripted",
      position: 1,
      isDefault: true,
    },
    {
      name: "In review",
      category: "review_needed",
      color: "#F59E0B",
      description: "Ready for stakeholder or client review",
      position: 2,
      isDefault: true,
    },
    {
      name: "Changes requested",
      category: "changes_required",
      color: "#EF4444",
      description: "Revisions needed based on feedback",
      position: 3,
      isDefault: true,
    },
    {
      name: "Approved",
      category: "approved",
      color: "#10B981",
      description: "Signed off for production",
      position: 4,
      isDefault: true,
    },
  ];

  for (const st of defaultStatuses) {
    await prisma.workflowStatus.create({
      data: {
        teamId,
        ...st,
      },
    });
  }

  const defaultTemplates = [
    {
      name: "Commercial",
      aspectRatio: "16x9",
      frameCount: 12,
      fields: [
        { id: "duration", icon: "clock", label: "Duration", isEnabled: true },
        { id: "action", icon: "action", label: "Action/Direction", isEnabled: true },
        { id: "sound", icon: "mic", label: "Script/VO", isEnabled: true },
        { id: "sfx", icon: "headphone", label: "Sound Design", isEnabled: true },
        { id: "notes", icon: "clipboard", label: "Notes", isEnabled: true },
      ],
    },
    {
      name: "Social (Reels)",
      aspectRatio: "9x16",
      frameCount: 6,
      fields: [
        { id: "duration", icon: "clock", label: "Duration", isEnabled: true },
        { id: "camera", icon: "camera", label: "Visual Description", isEnabled: true },
        { id: "sound", icon: "mic", label: "Voiceover", isEnabled: true },
        { id: "sfx", icon: "headphone", label: "Sound Design", isEnabled: true },
        { id: "notes", icon: "clipboard", label: "Notes", isEnabled: true },
      ],
    },
    {
      name: "Social (Square)",
      aspectRatio: "1x1",
      frameCount: 8,
      fields: [
        { id: "duration", icon: "clock", label: "Duration", isEnabled: true },
        { id: "camera", icon: "camera", label: "Visual Description", isEnabled: true },
        { id: "sound", icon: "mic", label: "Voiceover", isEnabled: true },
        { id: "notes", icon: "clipboard", label: "Notes", isEnabled: true },
      ],
    },
    {
      name: "Social (Portrait)",
      aspectRatio: "4:5",
      frameCount: 8,
      fields: [
        { id: "duration", icon: "clock", label: "Duration", isEnabled: true },
        { id: "camera", icon: "camera", label: "Visual Description", isEnabled: true },
        { id: "sound", icon: "mic", label: "Voiceover", isEnabled: true },
        { id: "notes", icon: "clipboard", label: "Notes", isEnabled: true },
      ],
    },
    {
      name: "Short Film",
      aspectRatio: "16x9",
      frameCount: 24,
      fields: [
        { id: "action", icon: "action", label: "Action/Direction", isEnabled: true },
        { id: "sound", icon: "chat_bubble", label: "Dialogue", isEnabled: true },
        { id: "sfx", icon: "headphone", label: "Sound Design", isEnabled: true },
        { id: "notes", icon: "clipboard", label: "Notes", isEnabled: true },
      ],
    },
  ];

  for (const tpl of defaultTemplates) {
    await prisma.storyboardTemplate.create({
      data: {
        teamId,
        name: tpl.name,
        aspectRatio: tpl.aspectRatio,
        frameCount: tpl.frameCount,
        fieldsJson: JSON.stringify(tpl.fields),
      },
    });
  }

  // Create the 4 standard Boords Asset Library folders
  const folderNames = ["Characters", "Locations", "Props", "Unfiled"];
  const folders: Record<string, string> = {};
  for (let i = 0; i < folderNames.length; i++) {
    const f = await prisma.assetFolder.create({
      data: {
        teamId,
        name: folderNames[i],
        position: i,
      },
    });
    folders[folderNames[i]] = f.id;
  }

  // Standard Boords starter reference assets (@alex, @sam, @sarah, @leo, @office, @street, @kitchen, @park, @phone, @car, @product, @box)
  const starterAssets = [
    {
      folder: "Characters",
      filename: "Alex",
      mentionHandle: "alex",
      alt: "Woman in her 30s with dark shoulder-length hair, wearing a rust jacket over a white t-shirt.",
      accent: "#C85A32",
    },
    {
      folder: "Characters",
      filename: "Sam",
      mentionHandle: "sam",
      alt: "Man in his 40s with a short beard, wearing a navy overshirt over a grey t-shirt.",
      accent: "#2B4C7E",
    },
    {
      folder: "Characters",
      filename: "Sarah",
      mentionHandle: "sarah",
      alt: "Woman in her 60s with a grey bob, wearing a green cardigan over a cream blouse.",
      accent: "#3A7D5C",
    },
    {
      folder: "Characters",
      filename: "Leo",
      mentionHandle: "leo",
      alt: "Man in his 20s with short black hair and round glasses, wearing a yellow hoodie.",
      accent: "#E5A93B",
    },
    {
      folder: "Locations",
      filename: "Office",
      mentionHandle: "office",
      alt: "Modern open-plan office with rows of desks, monitors, large windows and plants.",
      accent: "#5A7D9A",
    },
    {
      folder: "Locations",
      filename: "Street",
      mentionHandle: "street",
      alt: "City street at a pedestrian crossing with brick buildings and shopfronts.",
      accent: "#7D6B5D",
    },
    {
      folder: "Locations",
      filename: "Kitchen",
      mentionHandle: "kitchen",
      alt: "Bright home kitchen with a central island, wooden worktops and white cabinets.",
      accent: "#D99B66",
    },
    {
      folder: "Locations",
      filename: "Park",
      mentionHandle: "park",
      alt: "City park path with wooden benches, mature trees and a lawn in soft afternoon daylight.",
      accent: "#4E8C57",
    },
    {
      folder: "Props",
      filename: "Phone",
      mentionHandle: "phone",
      alt: "Modern smartphone with a dark screen standing upright at a slight angle.",
      accent: "#334155",
    },
    {
      folder: "Props",
      filename: "Car",
      mentionHandle: "car",
      alt: "Small blue hatchback car in three-quarter front view.",
      accent: "#2563EB",
    },
    {
      folder: "Props",
      filename: "Product",
      mentionHandle: "product",
      alt: "Unbranded white cosmetic bottle with a pump top.",
      accent: "#94A3B8",
    },
    {
      folder: "Props",
      filename: "Box",
      mentionHandle: "box",
      alt: "Plain unbranded kraft cardboard box, closed, at a slight angle.",
      accent: "#B48352",
    },
  ];

  for (let i = 0; i < starterAssets.length; i++) {
    const a = starterAssets[i];
    const svgUrl = generateAssetSvgDataUrl(a.filename, a.folder, a.accent);
    await prisma.libraryAsset.create({
      data: {
        teamId,
        folderId: folders[a.folder],
        name: a.filename,
        mentionName: `@${a.mentionHandle}`,
        category: a.folder.toLowerCase().replace(/s$/, ""),
        isStarter: true,
        filename: a.filename,
        mentionHandle: a.mentionHandle,
        alt: a.alt,
        imageUrl: svgUrl,
        thumbnailUrl: svgUrl,
        position: i,
      },
    });
  }
}
