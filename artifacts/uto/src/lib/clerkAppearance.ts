const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const SAGE = "#a5dd8f";
const SAGE_HOVER = "#94cf7d";
const TEXT = "#716e6e";
const TEXT_STRONG = "#3f3d3d";

export const clerkAppearance = {
  cssLayerName: "clerk",
  options: {
    logoPlacement: "none" as const,
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
  variables: {
    colorPrimary: SAGE,
    colorForeground: TEXT_STRONG,
    colorMutedForeground: TEXT,
    colorDanger: "#c0392b",
    colorBackground: "#fbf8f1",
    colorInput: "#ffffff",
    colorInputForeground: TEXT_STRONG,
    colorNeutral: "#d8d4cc",
    fontFamily:
      '"EB Garamond", "Cormorant Garamond", "Georgia", serif',
    borderRadius: "10px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-[#fbf8f1] border border-[#e3dfd5] rounded-2xl w-[420px] max-w-full overflow-hidden shadow-[0_30px_80px_-30px_rgba(28,24,36,0.25)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none px-7 py-6",
    footer:
      "!shadow-none !border-0 !bg-transparent !rounded-none border-t border-[#ece8de]",
    main: "gap-4",

    headerTitle:
      "text-[24px] font-medium text-[#3f3d3d] text-center [letter-spacing:1.10px]",
    headerSubtitle:
      "text-[14px] text-[#716e6e] text-center [letter-spacing:1.10px]",

    socialButtonsBlockButton:
      "border border-[#94cf7d] bg-[#a5dd8f] hover:bg-[#94cf7d] !text-[#716e6e] rounded-lg h-11 [letter-spacing:1.10px]",
    socialButtonsBlockButtonText:
      "text-[14px] font-medium !text-[#716e6e] [letter-spacing:1.10px]",

    dividerLine: "bg-[#e3dfd5]",
    dividerText:
      "text-[11px] uppercase tracking-[0.18em] text-[#716e6e] font-medium px-2",

    formFieldLabel:
      "text-[12px] font-medium uppercase text-[#716e6e] [letter-spacing:1.10px]",
    formFieldInput:
      "bg-white border border-[#d8d4cc] rounded-lg h-11 px-3 text-[15px] text-[#3f3d3d] focus:border-[#a5dd8f] focus:ring-2 focus:ring-[#a5dd8f]/30 outline-none [letter-spacing:1.10px]",
    formFieldRow: "gap-1.5",
    formFieldSuccessText: "text-[13px] text-[#3a7a3a]",
    otpCodeFieldInput:
      "bg-white border border-[#d8d4cc] rounded-lg text-[#3f3d3d] focus:border-[#a5dd8f]",

    formButtonPrimary:
      "bg-[#a5dd8f] hover:bg-[#94cf7d] !text-[#716e6e] rounded-lg h-11 text-[15px] font-medium [letter-spacing:1.10px]",

    footerAction: "text-center py-3",
    footerActionText: "text-[13px] text-[#716e6e] [letter-spacing:1.10px]",
    footerActionLink:
      "text-[13px] font-medium text-[#7e45ab] hover:text-[#6a3a90] underline-offset-2 [letter-spacing:1.10px]",

    identityPreviewEditButton:
      "text-[#7e45ab] hover:text-[#6a3a90] [letter-spacing:1.10px]",
    alert: "rounded-lg border border-[#e6cccc] bg-[#fbf2f2] px-3 py-2",
    alertText: "text-[13px] text-[#7a2a2a] [letter-spacing:1.10px]",
  },
};
