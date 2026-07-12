import { cn } from "@/lib/utils";

type AuthMortgageBackgroundProps = {
  className?: string;
};

/**
 * Asymmetric wave — high left, dips center-left, rises toward right (~60% blue).
 */
const BLUE_WAVE_PATH =
  "M0,0 L1440,0 L1440,290 C1200,300 900,395 650,400 C400,405 200,340 0,280 L0,0 Z";

const HEX_TILE_WHITE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cpath d='M13.99 9.25l13.7 7.9v15.81l-13.7 7.9-13.7-7.9V17.15z' fill='none' stroke='%23a8c4ef' stroke-opacity='0.4' stroke-width='1'/%3E%3C/svg%3E")`;

export function AuthMortgageBackground({ className }: AuthMortgageBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden bg-white", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 810"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="auth-sky-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--brand-navy, #061535)" />
            <stop offset="40%" stopColor="var(--brand-blue-dark, #0b2558)" />
            <stop offset="100%" stopColor="var(--brand-blue, #1a4a96)" />
          </linearGradient>

          <clipPath id="auth-blue-clip">
            <path d={BLUE_WAVE_PATH} />
          </clipPath>

          <pattern
            id="auth-hex-blue"
            width="28"
            height="49"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M13.99 9.25l13.7 7.9v15.81l-13.7 7.9-13.7-7.9V17.15z"
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* Blue sky with left→right gradient */}
        <path fill="url(#auth-sky-gradient)" d={BLUE_WAVE_PATH} />

        {/* Hex grid clipped to blue region only */}
        <rect
          x="0"
          y="0"
          width="1440"
          height="810"
          fill="url(#auth-hex-blue)"
          clipPath="url(#auth-blue-clip)"
        />
      </svg>

      {/* Soft hex cluster — bottom-right of white area */}
      <svg
        className="absolute right-0 bottom-0 h-[50%] w-[60%] text-[#8eb5e8]"
        viewBox="0 0 800 400"
        preserveAspectRatio="xMaxYMax meet"
        aria-hidden
      >
        <defs>
          <linearGradient id="auth-hex-fade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="45%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0.85" />
          </linearGradient>
          <mask id="auth-hex-cluster-mask">
            <rect width="800" height="400" fill="url(#auth-hex-fade)" />
          </mask>
        </defs>
        <g mask="url(#auth-hex-cluster-mask)" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M620 80l52 30v60l-52 30-52-30V110z" strokeOpacity="0.45" />
          <path d="M680 140l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.35" />
          <path d="M560 140l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.3" />
          <path d="M700 220l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.5" />
          <path d="M640 260l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.4" />
          <path d="M720 300l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.55" />
          <path d="M580 220l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.25" />
          <path d="M660 340l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.45" />
          <path d="M740 180l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.3" />
          <path d="M520 260l52 30v60l-52 30-52-30v-60z" strokeOpacity="0.2" />
        </g>
      </svg>

      {/* Tiled hex fade reinforcing bottom-right cluster on white */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45%]"
        style={{
          backgroundImage: HEX_TILE_WHITE,
          backgroundSize: "28px 49px",
          maskImage:
            "radial-gradient(ellipse 85% 75% at 88% 98%, black 0%, rgba(0,0,0,0.35) 35%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 75% at 88% 98%, black 0%, rgba(0,0,0,0.35) 35%, transparent 70%)",
        }}
      />
    </div>
  );
}

export const authInputClassName =
  "h-10 rounded-sm border border-[#c5cdd8] bg-white px-3 text-sm text-[#1f2937] shadow-none focus-visible:border-[#1e4db7] focus-visible:ring-0";

export const authButtonClassName =
  "h-10 w-full rounded-sm bg-brand-blue text-sm font-semibold text-white hover:opacity-90";
