/* Tweaks for "A Life in Practice" — applies to CSS vars / body classes */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "typeset": "Bodoni · Cormorant",
  "accent": "#c6a357",
  "motion": 1,
  "grain": true,
  "interludeWarm": true
}/*EDITMODE-END*/;

const TYPESETS = {
  "Bodoni · Cormorant": {
    display: '"Bodoni Moda", serif',
    body: '"Cormorant Garamond", serif',
  },
  "Playfair · EB Garamond": {
    display: '"Playfair Display", serif',
    body: '"EB Garamond", serif',
  },
  "Fraunces · Newsreader": {
    display: '"Fraunces", serif',
    body: '"Newsreader", serif',
  },
};

const ACCENTS = ["#c6a357", "#b08d57", "#9c9a8e", "#a8612f"];

function hi(hex) {
  // lighten accent for the --gold-hi var
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = Math.min(255, r + 38); g = Math.min(255, g + 34); b = Math.min(255, b + 24);
  return `rgb(${r},${g},${b})`;
}
function dim(hex) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},0.4)`;
}

function ensureFont(name) {
  const map = {
    "Playfair Display": "Playfair+Display:ital,wght@0,400..700;1,400..600",
    "EB Garamond": "EB+Garamond:ital,wght@0,400..600;1,400..500",
    "Fraunces": "Fraunces:ital,opsz,wght@0,9..144,400..600;1,9..144,400..500",
    "Newsreader": "Newsreader:ital,opsz,wght@0,6..72,400..600;1,6..72,400..500",
  };
  const key = map[name];
  if (!key) return;
  const id = "gf-" + name.replace(/\s+/g, "-");
  if (document.getElementById(id)) return;
  const l = document.createElement("link");
  l.id = id;
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=" + key + "&display=swap";
  document.head.appendChild(l);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const root = document.documentElement;

  React.useEffect(() => {
    const set = TYPESETS[t.typeset] || TYPESETS["Bodoni · Cormorant"];
    [set.display, set.body].forEach((f) => {
      const fam = f.match(/"([^"]+)"/);
      if (fam) ensureFont(fam[1]);
    });
    root.style.setProperty("--font-display", set.display);
    root.style.setProperty("--font-body", set.body);
  }, [t.typeset]);

  React.useEffect(() => {
    root.style.setProperty("--gold", t.accent);
    root.style.setProperty("--gold-hi", hi(t.accent));
    root.style.setProperty("--gold-dim", dim(t.accent));
  }, [t.accent]);

  React.useEffect(() => {
    root.style.setProperty("--motion", String(t.motion));
  }, [t.motion]);

  React.useEffect(() => {
    document.getElementById("grain").classList.toggle("off", !t.grain);
  }, [t.grain]);

  React.useEffect(() => {
    document.getElementById("chPractice").style.setProperty(
      "background", t.interludeWarm ? "var(--cream)" : "#dfe0dd"
    );
  }, [t.interludeWarm]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Typography" />
      <TweakSelect
        label="Typeset"
        value={t.typeset}
        options={Object.keys(TYPESETS)}
        onChange={(v) => setTweak("typeset", v)}
      />
      <TweakSection label="Accent" />
      <TweakColor
        label="Gold"
        value={t.accent}
        options={ACCENTS}
        onChange={(v) => setTweak("accent", v)}
      />
      <TweakToggle
        label="Warm paper interlude"
        value={t.interludeWarm}
        onChange={(v) => setTweak("interludeWarm", v)}
      />
      <TweakSection label="Motion & Texture" />
      <TweakSlider
        label="Motion intensity"
        value={t.motion}
        min={0}
        max={1.6}
        step={0.1}
        onChange={(v) => setTweak("motion", v)}
      />
      <TweakToggle
        label="Film grain"
        value={t.grain}
        onChange={(v) => setTweak("grain", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
