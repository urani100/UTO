const UI_FONT_FAMILY =
  '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';

const UI_COLOR = "#716e6e";
const UI_LETTER_SPACING = "1.10px";

const baseLabel = {
  fontFamily: UI_FONT_FAMILY,
  fontWeight: 500,
  color: UI_COLOR,
  letterSpacing: UI_LETTER_SPACING,
} as const;

const headerTitleStyle = {
  ...baseLabel,
  fontSize: "15px",
} as const;

const headerSubtitleStyle = {
  ...baseLabel,
  fontSize: "12px",
} as const;

const formFieldLabelStyle = {
  ...baseLabel,
  fontSize: "12px",
} as const;

const formFieldInputStyle = {
  ...baseLabel,
  fontSize: "12px",
  fontWeight: 400,
} as const;

const socialButtonsBlockButtonStyle = {
  ...baseLabel,
  fontSize: "12px",
} as const;

const dividerTextStyle = {
  ...baseLabel,
  fontSize: "12px",
} as const;

const footerActionTextStyle = {
  ...baseLabel,
  fontSize: "12px",
} as const;

const footerActionLinkStyle = {
  fontFamily: UI_FONT_FAMILY,
  fontSize: "12px",
  fontWeight: 500,
  letterSpacing: UI_LETTER_SPACING,
} as const;

const formButtonPrimaryStyle = {
  fontFamily: UI_FONT_FAMILY,
  fontSize: "15px",
  fontWeight: 500,
  letterSpacing: UI_LETTER_SPACING,
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
    formFieldLabel: formFieldLabelStyle,
    formFieldInput: formFieldInputStyle,
    socialButtonsBlockButton: socialButtonsBlockButtonStyle,
    socialButtonsBlockButtonText: socialButtonsBlockButtonStyle,
    dividerText: dividerTextStyle,
    footerActionText: footerActionTextStyle,
    footerActionLink: footerActionLinkStyle,
    formButtonPrimary: formButtonPrimaryStyle,
  },
};
