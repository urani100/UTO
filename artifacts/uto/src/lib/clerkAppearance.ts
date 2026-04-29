const HEADER_FONT_FAMILY =
  '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';

const headerTitleStyle = {
  fontFamily: HEADER_FONT_FAMILY,
  fontSize: "15px",
  fontWeight: 500,
  color: "#716e6e",
  letterSpacing: "1.10px",
} as const;

const headerSubtitleStyle = {
  fontFamily: HEADER_FONT_FAMILY,
  fontSize: "12px",
  fontWeight: 500,
  color: "#716e6e",
  letterSpacing: "1.10px",
} as const;

export const clerkAppearance = {
  cssLayerName: "clerk",
  options: {
    logoPlacement: "none" as const,
  },
  variables: {
    colorPrimary: "#a5dd8f",
    fontFamily:
      '"EB Garamond", "Cormorant Garamond", "Georgia", serif',
  },
  elements: {
    headerTitle: headerTitleStyle,
    headerSubtitle: headerSubtitleStyle,
  },
};
