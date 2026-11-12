---
name: HOLO-NET Fleet Registry
description: A mission-control cockpit for fictional fleet logistics, temporal lore and evidence-first natural queries.
colors:
  deep-void: "#070c13"
  surface: "#121c29"
  surface-raised: "#172433"
  rule: "#496075"
  ink: "#ecf3f7"
  secondary-ink: "#bfcedb"
  telemetry-muted: "#91b5ca"
  action-yellow: "#f3e600"
  signal-cyan: "#58e0e9"
  alert-red: "#f47b84"
  press: "#203449"
typography:
  display:
    fontFamily: "Oxanium, Arial, sans-serif"
    fontSize: "clamp(2.5rem, 4.5vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Oxanium, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "IBM Plex Sans, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  command: "2px"
spacing:
  tight: "8px"
  normal: "13px"
  panel: "22px"
  section: "35px"
components:
  button-primary:
    backgroundColor: "{colors.action-yellow}"
    textColor: "{colors.deep-void}"
    typography: "{typography.label}"
    rounded: "{rounded.command}"
    padding: "13px 15px"
  button-primary-hover:
    backgroundColor: "#fff07c"
    textColor: "{colors.deep-void}"
  input-query:
    backgroundColor: "#081522"
    textColor: "{colors.ink}"
    rounded: "{rounded.command}"
    padding: "12px 13px"
  card-command:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.command}"
    padding: "19px 22px"
  nav-active:
    backgroundColor: "{colors.press}"
    textColor: "{colors.ink}"
    padding: "10px 14px"
---

# Design System: HOLO-NET Fleet Registry

## Overview

**Creative North Star: "O Holotable de Comando".**

The UI must look and behave like a console used to make decisions, not a promotional landing page. The important things in the first viewport are a sector visualization, a real read-only query, contextual era/faction controls and a useful stock manifest. Industrial precision and the atmosphere of Star Wars command equipment come from layout, lettering, measurement, source provenance and restrained telemetry accents rather than heavy overlays or generic neon widgets.

**Key Characteristics:**
- Dark, low-glare workstation background, precise lines and organized information density.
- Golden action color, cyan verification/source accents, red only for an alert or named faction state.
- Schematic sector map is authored geometry; its relative positions are **not astronomical coordinates**.
- Portuguese interaction language with short, utilitarian labels.
- All claims identify synthetic inventory, lore references or unknown evidence.

## Colors

The palette is based on the functional cockpit tokens already used in `src/cockpit.css`. Frontmatter is normative.

### Primary
- **Action Yellow**: active call to action, selected item and the most important ready-to-act control; never general body copy.

### Secondary
- **Signal Cyan**: data sources, interactive text links and focus/response feedback. Do not turn every panel into a neon border.

### Tertiary
- **Alert Red**: critical or blocked actions, or precisely identified Imperial state. Never for a generic success message.

### Neutral
- **Deep Void**: persistent low-glare canvas.
- **Surface / Raised Surface**: instrument housings and actionable panels.
- **Ink**: essential readable text.
- **Secondary Ink and Telemetry Muted**: explanations versus machine-readable micro-labels; both should retain contrast.
- **Rule**: boundaries and table lines, not decorative boxes around everything.

**The Provenance Rule.** Color must never make a simulated quantity look like canonical history. The text still names the evidence type.

## Typography

**Display Font:** Oxanium (self-hosted through `@fontsource/oxanium`).
**Body Font:** IBM Plex Sans (self-hosted).
**Data/Label Font:** IBM Plex Mono (self-hosted).

**Character:** measured technical typography with a distinctive sci-fi display face. Text intended for humans stays in an efficient sans; monospace is for identifiers, numeric telemetry, codes and concise control labels.

### Hierarchy
- **Display:** Oxanium, heavy, capped below 5.5rem, used once for the operational title.
- **Title:** Oxanium, medium scale, used for active surfaces and subsections.
- **Body:** IBM Plex Sans, typically 12–14px with 1.6–1.75 line-height; descriptive paragraphs have constrained measure.
- **Label:** IBM Plex Mono, 9–11px, reserved for metadata, status, dimensions and measurements.

**The Operational Clarity Rule.** A numeric balance and its unit must remain distinguishable at a glance and in screen-reader order.

## Layout

Desktop: a slim navigation rail and a wide fluid command field. In the main command view, a two-column composition puts the schematic star map beside a **functional query panel**. The fleet manifest follows as a compact, scannable register, not a fourth equally weighted promotional card. The standard spacing vocabulary is tight (8px), normal (13px), panel (22px) and section (35px).

Below ~1100px, the map and query become a single vertical column. Below ~900px, the nav becomes a horizontally scrollable tab strip. Below ~640px, the headline and readiness tally stack and the manifest compresses but remains readable. The narrow 320–390px design hides nonessential map labels, retaining keyboard-readable buttons.

## Elevation & Depth

The interface is **flat by default**. Depth is produced by tonal layers, inset grids and well-spaced borders. The map uses an SVG with circles, routes and labeled interactive pins, supported by a restrained radial surface. Avoid detached drop shadows, glass effects and generic glowing cards.

**The Instruments Before Decoration Rule.** A shape can remain only if it helps navigation, reading a map, distinguishing evidence or understanding a system state.

## Shapes

Command rectangles use almost-square corners (2px). Panels have 1px rules, rather than heavy frames or chevron cut-outs. Planetary pins are small geometric focus targets with clear labels; their hover and focus states are stronger than their resting state.

## Components

### Buttons
- **Primary:** Action Yellow, dark text, high-contrast focus outline and direct verb labels.
- **Secondary:** navy/surface background with visible but low-key border.
- **States:** hover, keyboard focus, disabled, loading and blocked are always visibly distinct.

### Inputs
- **Query:** dark inset field, readable placeholder and live 500-character limit. Do not add fake command syntax.
- **Selectors:** native select semantics for era/faction, retaining browser keyboard support.
- **Errors:** name the cause and how to recover; do not use decorative red without text.

### Navigation
- **Desktop:** a concise left rail with immediately understandable nouns.
- **Mobile:** horizontally scrollable nav that keeps every destination accessible.
- **Active state:** subtle raised surface plus a narrow yellow keyline.

### Tactical Sector Map
- Nine pinned sectors are schematic only. Each accessible button navigates to its planet in the Atlas.
- The legend explains the position is illustrative. If a world is unknown for a given era, do not invent control.

### Query/Evidence Console
- **Default:** a real example question; user can run it immediately.
- **Result:** grounded quantity or lore, status, evidence type and where relevant an external source.
- **Failure:** unknown or blocked questions never become fabricated answers.
- **Model:** a separate explicitly optional local tool-routing mode; the public demo uses deterministic rules.

### Fleet Manifest
- Columns: model, planet, quantity and ready. Tabular numbers remain aligned.
- Data must be calculated from the current era/faction and backend when connected. The public page labels quantities fictitious.

## Do's and Don'ts

### Do:
- **Do** preserve quick access to a working query and stock information in the first viewport.
- **Do** maintain explicit distinctions between Canon, simulation and unverified information.
- **Do** keep every illustration and interface state functional and accessible.
- **Do** ship source-referenced, tested, responsive React code consistent with the application.
- **Do** use the same tokens for a new component rather than adding one-off colors.

### Don't:
- **Don't** replace actual inventory data with nonfunctional marketing mockups.
- **Don't** embed copyrighted Star Wars screenshots or assets without permission.
- **Don't** add fake login, publicly connected admin actions or unverified AI claims.
- **Don't** reintroduce a four-equal-metric-card hero, huge empty fields or decorative faux terminals.
- **Don't** suppress any error or unknown source with a confident story.
