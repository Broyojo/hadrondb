// Graphics APIs a Windows game can use, and the layer Hadron runs each one on (Hadron's README,
// "How it works").

export const GRAPHICS_APIS = ["D3D9", "D3D10", "D3D11", "D3D12", "Vulkan", "OpenGL", "other", "unknown"] as const;
export type GraphicsApi = (typeof GRAPHICS_APIS)[number];

export const GRAPHICS_INFO: Record<GraphicsApi, { label: string; path: string }> = {
  D3D9: { label: "Direct3D 9", path: "mtld3d, straight to Metal" },
  D3D10: { label: "Direct3D 10", path: "DXMT, straight to Metal" },
  D3D11: { label: "Direct3D 11", path: "DXMT, straight to Metal" },
  D3D12: { label: "Direct3D 12", path: "vkd3d-proton on KosmicKrisp (Vulkan on Metal)" },
  Vulkan: { label: "Vulkan", path: "KosmicKrisp, Mesa's Vulkan driver on Metal" },
  OpenGL: { label: "OpenGL", path: "Zink on KosmicKrisp" },
  other: { label: "Other", path: "" },
  unknown: { label: "Not known", path: "" },
};

export function graphicsApiByLabel(label: string): GraphicsApi | undefined {
  const l = label.trim().toLowerCase();
  return GRAPHICS_APIS.find((g) => GRAPHICS_INFO[g].label.toLowerCase() === l || g.toLowerCase() === l);
}

export const ARCHES = ["32-bit", "64-bit", "unknown"] as const;
export type Arch = (typeof ARCHES)[number];
