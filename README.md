# Response Instructions + Write For Me
### A SillyTavern Extension by bumyann

tired of saucepan's 500 char limit? me too. this adds response instructions (inject a quick prompt before the ai replies) and a write-for-me panel (let the ai draft your user message) straight into ST. presets, no char limits, mobile friendly.

made this bc i loved saucepan's RI and WFM ui too much but kept getting pulled back to ST for how customizable it is — so i just. made it myself. now i don't have to choose lol

Disclaimer: I didn't actually make it. This shit is vibe-coded to the max. But I did test it before publishing it because I'm not a rat. Also, I'm aware Guided Generations, Impersonate, etc. exists but I want ultraspecific things and it's just not the same </3 Do what you will with this information.

---

## Features

### 📜 Response Instructions
- Persistent instruction panel above the chat input
- Write steering instructions for the AI's next reply — **no character limit**
- Toggle to enable/disable without clearing your text
- Green dot indicator on the bar when active
- Preset library — save, rename, load, and delete named instruction sets
- Injected as a system message, last in the prompt (highest influence position)
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

### via SillyTavern (recommended)
1. In ST, go to **Extensions** → **Install extension**
2. Paste: `https://github.com/bumyann/sillytavern-response-instructions`
3. Click **Save** — ST installs it automatically
4. Enable it in the Extensions list

### manual
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

## ⚠️ Important: Preset Compatibility

This extension injects Response Instructions into your prompt using a key (`response_instructions_injection`) that SillyTavern reads through its extension prompt system.

**This works automatically for most users.** But if you use a **heavily customized Chat Completion preset** — one where you've manually built out the entire `prompt_order` (common with complex character-system presets like F.A.Y.E. OS, or anything you've deeply restructured yourself) — that preset's order list only includes prompts it explicitly knows about. Since it has no idea our extension exists, Response Instructions can silently fail to reach the AI even though the toggle shows it's "on."

**How to tell if this affects you:**
If you toggle Response Instructions on, write something obvious like "always end your response with the word BANANA," send a message, and the AI never does it — and this happens consistently across multiple models — this is almost certainly why.

**The fix (built in, as of v2.1.0):**
Open the Response Instructions panel. If your active preset is incompatible, a yellow warning banner will appear automatically with a **Fix it** button. Click it, and the extension will:
1. Add a `response_instructions_injection` entry to your preset's prompt list
2. Insert it into your preset's prompt order (right after chat history, for maximum priority)
3. Save the patched preset

This only needs to be done once per preset. If you create or import a new preset later, you may need to hit **Fix it** again for that preset.

If you dismiss the banner instead of fixing it, it won't show again for that preset — but Response Instructions also won't work until it's patched (or until you switch back to a compatible preset).

**Manual patch (if the auto-fix button doesn't work for some reason):**
1. Open your preset's **AI Response Configuration**
2. You'll need to add a new prompt manually via "New prompt" with the identifier `response_instructions_injection`, role `system`, and leave content blank
3. Drag it into your prompt order, ideally right after Chat History
4. Save the preset

---

## Theming

Adapts automatically to whatever ST theme you have active via `--SmartTheme*` CSS variables. Want to customise it further for your own theme? Target `.ri-bar`, `.ri-panel`, `.wfm-panel`, `.ri-modal-inner`, `.ri-compat-banner` etc. in your theme's custom CSS.

---

## Requirements
- SillyTavern 1.17.0+
- Active API connection for Write For Me

---

## Changelog

**v2.1.1**
- Response Instructions now injects at both position 4 (end of prompt) AND position 1 (Author's Note depth) simultaneously, for redundancy across different presets and backends
- Compatibility check and auto-patch now cover both injection points

**v2.1.0**
- Added automatic preset compatibility detection and one-click patching for custom `prompt_order` presets
- Fixed Write For Me's `generateRaw` call signature for ST 1.17

**v2.0.0**
- Switched Write For Me from modal to inline panel (fixes mobile not opening)
- Fully adaptive theming via `--SmartTheme*` variables only
- Added preset rename for both libraries

---

## License
MIT
