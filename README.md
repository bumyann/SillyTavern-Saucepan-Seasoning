# Response Instructions + Write For Me
### A SillyTavern Extension by bumyann

Tired of Saucepan's 500 character limit? Me too. This adds response instructions (inject a quick prompt before the ai replies) and a write-for-me panel (let the ai draft your user message) straight into ST. Presets, no character limits, mobile friendly.

Made this bc I loved Saucepan's Response Instructions and Write For Me UI too much but kept getting pulled back to ST for how customizable it is — so I just. made it myself. now I don't have to choose lol.

Disclaimer: I didn't actually make it. This shit is vibe-coded to the max. But I did test it before publishing it because I'm not a rat. Also, I'm aware Guided Generations, Impersonate, etc. exists but I want something simpler and ultra-speciific because I'm funny like that </3 Do what you will with this information.

---

## ⚠️ V2.0 — Rebuilt injection engine

Versions 1.x used SillyTavern's `setExtensionPrompt()` API, which writes into a generic extension prompt slot that some Chat Completion presets (especially heavily customized ones) silently don't read from. After extensive debugging across multiple models, presets, and chat lengths, this turned out to be unreliable in ways that were hard to predict or patch around consistently.

**V2.0 switches to STscript's `/inject` command instead** — the same mechanism used by [Guided Generations](https://github.com/Samueras/GuidedGenerations-Extension), a well-tested extension with 180+ stars. `/inject` writes directly to chat metadata and is read by ST's prompt builder unconditionally, regardless of preset configuration. This should be dramatically more reliable across different presets, backends, and setups.

---

## Features

### 📜 Response Instructions
- Persistent instruction panel above the chat input
- Write steering instructions for the AI's next reply — **no character limit**
- Toggle to enable/disable without clearing your text
- Green dot indicator on the bar when active
- Preset library — save, rename, load, and delete named instruction sets
- Injected via STscript `/inject`, depth 0 (last thing before generation, highest influence)
- Persists until you manually clear it

### ✨ Write For Me
- AI-powered message drafting panel, also above the chat input
- Optionally write an instruction to steer how your message is written
- Hit **Generate** — uses your currently connected ST API and model
- Browse multiple drafts with ← → navigation
- Edit the result directly before using it
- Hit **Use this** to push the draft into the chat input, then send normally
- Separate preset library, fully independent from Response Instructions

---

## Installation

### Via SillyTavern (recommended)
1. In ST, go to **Extensions** → **Install extension**
2. Paste: `https://github.com/bumyann/sillytavern-response-instructions`
3. Click **Save** — ST installs it automatically
4. Enable it in the Extensions list

### Manual
1. Download this repo as a ZIP (Code → Download ZIP)
2. Extract into `SillyTavern/public/extensions/third-party/`
3. Make sure the folder is named `response-instructions` and contains `manifest.json`, `index.js`, and `style.css`
4. Reload ST and enable the extension under Extensions

---

## Usage

Both features live in a bar just above the chat input.

**Response Instructions:**
- Click **Instructions** to expand the panel
- Type whatever you want — no limit
- Toggle **ON** → green dot appears, instructions inject on the next send
- 📁 folder icon → preset library
- 🗑️ trash icon → clear instructions
- ✕ → collapse the panel (stays active if toggled on)

**Write For Me:**
- Click **Write For Me** to expand the panel
- Optionally add an instruction e.g. *"act nervous and avoid eye contact"*
- **Generate** → AI drafts a message using your current chat context
- Generate again for another draft, browse with ← →
- Edit freely, then **Use this** → copied into chat input, ready to send

---

## Theming

Adapts automatically to whatever ST theme you have active via `--SmartTheme*` CSS variables. Want to customise it further for your own theme? Target `.ri-bar`, `.ri-panel`, `.wfm-panel`, `.ri-modal-inner` etc. in your theme's custom CSS.

---

## Requirements
- SillyTavern 1.12.9+ (for `/inject` STscript support)
- Active API connection for Write For Me

---

## Troubleshooting

If instructions still don't seem to reach the AI:
1. Open the prompt itemization on the AI's response (small icon on the message) and search for `[OOC SYSTEM DIRECTIVE`
2. If it's missing, check the browser console for `[RI] /inject failed:` errors
3. Confirm the green dot is showing on the Instructions button before sending

---

## Changelog

**v2.0.0**
- Complete rebuild of the injection engine using STscript `/inject` instead of `setExtensionPrompt()`
- Removed the preset auto-patch feature (no longer necessary)
- Fixed reliability issues across multiple presets, backends, and chat lengths

**v1.1.1**
- Response Instructions injected at both position 4 (end of prompt) AND position 1 (Author's Note depth) simultaneously, for redundancy across different presets and backends
- Compatibility check and auto-patch covered both injection points

**v1.1.0**
- Added automatic preset compatibility detection and one-click patching for custom `prompt_order` presets
- Fixed Write For Me's `generateRaw` call signature for ST 1.17

**v1.0.0**
- Switched Write For Me from modal to inline panel (fixes mobile not opening)
- Fully adaptive theming via `--SmartTheme*` variables only
- Added preset rename for both libraries

---

## License
MIT
