# Design System — Alignement Portfolio

Ce projet doit partager le **même langage visuel** que le portfolio Ahmad Gueye.
Respecte ces règles à la lettre. Ne réinvente pas une autre esthétique.

Référence : portfolio `my-portfolio` (Outfit + Syne, tokens CSS, light/dark, fond à glows subtils).

Stack actuelle : React + Vite — charger les polices via Google Fonts / `@fontsource`, pas `next/font`.

---

## 1. Direction visuelle

- Look **minimal, net, contemporain** — pas de dashboard surchargé.
- Une composition claire par écran : un objectif principal, peu de distractions.
- Atmosphère via **fond à gradients radiaux soft** (glows), pas un aplat plat.
- Dark mode par défaut ; light mode via classe `.dark` sur `<html>`.
- Transitions courtes (`0.2s`–`0.35s ease`), motion utile (apparition, hover), jamais gadget.
- Toujours respecter `prefers-reduced-motion: reduce`.

### Interdits (anti-patterns AI)

- Thème violet / indigo / purple-on-white
- Fond crème chaud (#F4F1EA) + serif terracotta
- Layout « broadsheet » (règles hairline, zéro radius, colonnes denses type journal)
- Glow néon excessifs, multi-layer shadows lourdes
- Pills `rounded-full` partout, emojis décoratifs
- Cards partout : une card n’existe que si elle porte une **interaction** claire
- Stats strips, badges flottants, chip clusters, overlays promo

---

## 2. Typographie (obligatoire)

| Rôle | Police | Usage |
|------|--------|--------|
| Body / UI | **Outfit** | Texte courant, labels, boutons, nav |
| Display | **Syne** (500–700) | Titres, brand, chiffres timer, headings |

- Variables CSS :
  - `--font-body` → Outfit
  - `--font-display` → Syne
- Titres : `font-display` + `font-semibold` / `font-bold` + `tracking-tight`
- Hiérarchie :
  - Timer / hero : `text-4xl`–`text-5xl` display
  - Section : `text-xl` display semibold
  - Corps : `text-sm` / `text-base`, `leading-relaxed`
  - Secondaire : `text-muted` / `var(--muted)`

**Ne pas** utiliser Inter, Roboto, Arial, system-ui comme police principale.

---

## 3. Tokens CSS (copier tels quels)

```css
:root {
  --bg: #f4f4f5;
  --fg: #0a0a0a;
  --muted: #525252;
  --surface: #ffffff;
  --border: rgba(0, 0, 0, 0.1);
  --inverse: #0a0a0a;
  --scrollbar: #0a0a0a;
  --header-bg: rgba(244, 244, 245, 0.72);
  --accent: #3b82f6;
  --available: #ea580c;
  --glow: rgba(59, 130, 246, 0.14);
  --glow-cyan: rgba(34, 211, 238, 0.1);
  --glow-teal: rgba(45, 212, 191, 0.09);
  --glow-soft: rgba(59, 130, 246, 0.05);
}

.dark {
  --bg: #090909;
  --fg: #ffffff;
  --muted: #a3a3a3;
  --surface: #111111;
  --border: rgba(255, 255, 255, 0.1);
  --inverse: #ffffff;
  --scrollbar: #ffffff;
  --header-bg: rgba(9, 9, 9, 0.72);
  --accent: #3b82f6;
  --available: #4ade80;
  --glow: rgba(59, 130, 246, 0.18);
  --glow-cyan: rgba(34, 211, 238, 0.12);
  --glow-teal: rgba(45, 212, 191, 0.11);
  --glow-soft: rgba(59, 130, 246, 0.06);
}
```

### Mapping Tailwind (si utilisé)

```js
darkMode: "class",
theme: {
  extend: {
    colors: {
      background: "var(--bg)",
      foreground: "var(--fg)",
      muted: "var(--muted)",
      surface: "var(--surface)",
      border: "var(--border)",
      inverse: "var(--inverse)",
      accent: "var(--accent)",
    },
    fontFamily: {
      sans: ["var(--font-body)", "Outfit", "sans-serif"],
      display: ["var(--font-display)", "Syne", "sans-serif"],
    },
  },
},
```

Utiliser les tokens — pas de couleurs hardcodées hors système (sauf accent bleu ponctuel type point de marque).

---

## 4. Fond & atmosphère

```css
body {
  background-color: var(--bg);
  color: var(--fg);
  font-family: var(--font-body), "Outfit", sans-serif;
  background-image:
    radial-gradient(ellipse 85% 50% at 42% -12%, var(--glow), transparent 68%),
    radial-gradient(ellipse 60% 45% at 88% 18%, var(--glow-cyan), transparent 62%),
    radial-gradient(ellipse 55% 40% at 8% 55%, var(--glow-teal), transparent 60%),
    radial-gradient(ellipse 45% 30% at 70% 85%, var(--glow-soft), transparent 65%);
  background-attachment: fixed;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.font-display {
  font-family: var(--font-display), "Syne", sans-serif;
}
```

---

## 5. Layout & structure

- Conteneur centré : ~`w-11/12` mobile, `lg:w-8/12` desktop, `mx-auto`.
- Sections : padding vertical `3rem` → `4rem` (md), séparateur `1px solid var(--border)` si plusieurs blocs.
- Panneaux : border `var(--border)`, radius `1rem`, padding `1.25rem`–`1.5rem`.
- Header sticky optionnel : transparent au top ; au scroll → `var(--header-bg)` + `backdrop-filter: blur(12px)`.
- Radius UI : `rounded-lg` / `rounded-xl` / `1rem` — pas de tout-rond sauf dot de statut.

---

## 6. Composants UI

### CTA primaire
- Fond `var(--fg)`, texte `var(--bg)`, `rounded-lg`, `text-sm font-medium`.
- Hover : `translateY(-1px)`, glow soft via `--glow` / `--glow-cyan` / `--glow-teal`, opacity ~0.9.

### Outline / icon buttons
- Bordure `var(--border)`, hover `background: var(--surface)`.
- Icon buttons : ~`h-8 w-8` ou `h-10 w-10`, `rounded-lg`.

### Status (Focus / Pause / Break)
- `--available` (orange light / vert dark) pour état actif + dot pulsé si pertinent.
- Accent `#3b82f6` pour highlights ponctuels — pas comme couleur dominante de toute l’UI.

### Cards
- Uniquement pour zones interactives (timer, settings).
- Surface `--surface`, bordure `--border`, radius `1rem`.
- Pas d’ombre lourde.

---

## 7. Thème light / dark

- Toggle via classe `.dark` sur `<html>`.
- Persister `localStorage` clé `theme` (`light` | `dark`).
- Script inline tôt dans `index.html` pour éviter le flash (défaut : `dark`).
- Transition douce sur `background-color` et `color`.

Exemple anti-FOUC :

```html
<script>
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var theme = stored === "light" || stored === "dark" ? stored : "dark";
      if (theme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } catch (e) {
      document.documentElement.classList.add("dark");
    }
  })();
</script>
```

---

## 8. Motion (budget)

**2–3 motions intentionnelles** max :

1. Entrée du timer (`opacity` + `translateY` ~16px, ~0.7s ease-out).
2. Hover CTA (lift + glow soft).
3. Pulse du statut « en session », ou transition Focus → Pause.

Pas d’animations continues bruyantes sur tout l’écran.

---

## 9. Accessibilité

- Contraste lisible light **et** dark.
- `aria-label` sur boutons icon-only.
- Focus visible cohérent.
- Mobile-first : timer centré, contrôles accessibles au pouce.
- Scrollbar fine (~5px), thumb = `--scrollbar`.

---

## 10. Adaptation Pomodoro

| Élément | Traitement |
|---------|------------|
| Temps restant | `font-display`, très grand, `tracking-tight` |
| Mode (Focus / Pause / Break) | label `text-sm` + `--available` ou muted |
| Start / Pause / Reset | CTA primaire + outline icon |
| Settings (durées) | panneau borduré, inputs sobres |
| Stats / historique | sous le fold, une idée par bloc |

**Premier viewport** = nom de l’app + timer + une phrase courte + groupe CTA. Rien d’autre (pas de stats ni liste dense au-dessus).

---

## 11. Checklist avant livraison UI

- [ ] Outfit (body) + Syne (display) chargés
- [ ] Tokens `:root` / `.dark` identiques
- [ ] Fond multi-glow présent
- [ ] Pas de violet / crème terracotta / Inter
- [ ] CTA = fg/bg inversés (pas un gros bouton bleu saturé)
- [ ] Cards limitées aux interactions
- [ ] Dark/light sans FOUC
- [ ] `prefers-reduced-motion` respecté
- [ ] Composition claire : timer = héros
