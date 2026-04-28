const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export const clerkAppearance = {
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside",
    logoLinkUrl: basePath || "/",
    logoImageUrl:
      typeof window !== "undefined"
        ? `${window.location.origin}${basePath}/logo.svg`
        : "/logo.svg",
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
  variables: {
    colorPrimary: "#7e45ab",
    colorForeground: "#1c1824",
    colorMutedForeground: "#6b6877",
    colorDanger: "#c0392b",
    colorBackground: "#fbf8f1",
    colorInput: "#ffffff",
    colorInputForeground: "#1c1824",
    colorNeutral: "#d8d4cc",
    fontFamily: '"Inter", system-ui, sans-serif',
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

    logoBox: "flex justify-center mb-2",
    logoImage: "h-8 w-auto",

    headerTitle:
      "text-[20px] font-semibold tracking-tight text-[#1c1824] text-center",
    headerSubtitle: "text-[13px] text-[#6b6877] text-center",

    socialButtonsBlockButton:
      "border border-[#d8d4cc] bg-white text-[#1c1824] hover:bg-[#f3efe6] rounded-lg h-10",
    socialButtonsBlockButtonText: "text-[13px] font-medium text-[#1c1824]",

    dividerLine: "bg-[#e3dfd5]",
    dividerText:
      "text-[10.5px] uppercase tracking-[0.18em] text-[#8a8694] font-semibold px-2",

    formFieldLabel:
      "text-[11.5px] font-medium uppercase tracking-[0.12em] text-[#6b6877]",
    formFieldInput:
      "bg-white border border-[#d8d4cc] rounded-lg h-10 px-3 text-[13.5px] text-[#1c1824] focus:border-[#7e45ab] focus:ring-2 focus:ring-[#7e45ab]/20 outline-none",
    formFieldRow: "gap-1.5",
    formFieldSuccessText: "text-[12px] text-[#3a7a3a]",
    otpCodeFieldInput:
      "bg-white border border-[#d8d4cc] rounded-lg text-[#1c1824] focus:border-[#7e45ab]",

    formButtonPrimary:
      "bg-[#7e45ab] hover:bg-[#6a3a90] text-white rounded-lg h-10 text-[13px] font-semibold tracking-wide",

    footerAction: "text-center py-3",
    footerActionText: "text-[12.5px] text-[#6b6877]",
    footerActionLink:
      "text-[12.5px] font-medium text-[#7e45ab] hover:text-[#6a3a90] underline-offset-2",

    identityPreviewEditButton: "text-[#7e45ab] hover:text-[#6a3a90]",
    alert: "rounded-lg border border-[#e6cccc] bg-[#fbf2f2] px-3 py-2",
    alertText: "text-[12.5px] text-[#7a2a2a]",
  },
};
