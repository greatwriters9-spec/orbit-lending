export type ColorToken = {
  value: string;
  description?: string;
};

export type ColorTokens = Record<string, ColorToken>;

export type TypographyScale = {
  fontFamily: string;
  fontSize: string;
  fontWeight: number | string;
  lineHeight: string;
  letterSpacing?: string;
};

export type TypographyTokens = {
  fontFamilies: Record<string, string>;
  scales: Record<string, TypographyScale>;
};

export type SpacingTokens = Record<string, string>;

export type ShadowTokens = Record<string, string>;

export type RadiusTokens = Record<string, string>;

export type AnimationTokens = Record<string, string>;

export type DesignTheme = {
  colors: Record<string, string>;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  shadows: ShadowTokens;
  radius: RadiusTokens;
  animations: AnimationTokens;
};
