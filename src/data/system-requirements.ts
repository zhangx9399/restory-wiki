export const systemRequirementsFaqItems = [
  {
    question: "Is 4 GB RAM the official minimum for ReStory?",
    answer:
      "Yes. The official Steam store lists 4 GB RAM in the Windows minimum requirements.",
  },
  {
    question: "Does ReStory have official recommended PC requirements?",
    answer:
      "No. Steam currently publishes a minimum tier for Windows but no official recommended tier, so this page does not invent one.",
  },
  {
    question: "What should I try if ReStory appears GPU-bound?",
    answer:
      "Update the game, test one graphics or resolution change at a time, close GPU-heavy overlays or background apps, and record your version and hardware if the issue continues. Older build/version note: official playtest patch #0.1.018 suggested disabling VSync and trying a 30 or 60 FPS target, but that older-build advice may not apply to or solve every current-release problem.",
  },
] as const;
