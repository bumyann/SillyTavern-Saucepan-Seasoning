# Saucepan Seasoning — SillyTavern

<img src="https://i.imgur.com/x8a5kCp.png" alt="SaucepanSeasoning">

Port of SaucepanAI's response instructions and write-for-me UI for **SillyTavern**, as a native extension. Made this because I loved Saucepan's in-chat tools too much but kept getting pulled back to ST for how customizable it is — so I just ported them. now I don't have to choose lol.

Disclaimer: Vibe-coded with Claude. Tested before publishing because I'm not a rat. Yes, I know Guided Generations, Impersonate, etc. exists. I want something simpler and ultra-specific because I'm funny like that </3

---

## Features

### ✦ Response Instructions

Inject a steering instruction into the prompt before every AI reply — no character limit, no fuss.

- **Simple mode** — chip selectors for length, style, speak for, intimacy, pacing, and narration balance. picks compose into a clean natural language instruction automatically. good for quick setups without thinking too hard.
- **Custom mode** — raw freeform textarea. write exactly what you want, no restrictions.
- Toggle on/off at any time without clearing your text
- Green dot indicator on the bar stays visible when active, even with the panel closed
- Preset library — save, rename, load, and delete named instruction sets
- Injected via STscript `/inject`, depth 0 (last thing before generation, highest influence)

### ✦ Write For Me

AI drafts a reply for you using your active ST connection and the current chat context.

- Add an optional direction (`act nervous`, `change the subject`, `confess feelings`…) or leave it blank
- Hit **Generate** — uses whatever API and model you have connected in ST
- Browse drafts with ← → navigation, generate more if you don't like what you got
- **Bookmark** drafts you like with 🔖 — find them later in the **Saved** tab
- Hit **Use this** to drop the draft into the chat input, then send as normal
- Separate preset library for instructions, fully independent from Response Instructions

---

## Simple Mode — what does each field inject?

| Field | Option | Injected instruction |
|---|---|---|
| Length | Short | Keep your response brief and concise. |
| | Medium | Write a moderate length response. |
| | Long | Write a long, detailed response. |
| | Essay | Write a lengthy, essay-style response with thorough detail. |
| | Ramble | Write a lengthy, rambling response — don't cut yourself short. |
| Style | 1st Person | Narrate in first person. |
| | 2nd Person | Narrate in second person, addressing the user as "you". |
| | 3rd Person | Narrate in third person. |
| | Texting | Write in a casual text messaging style — short messages, no prose. |
| Speak For | Companion only | Only write dialogue and actions for your character. Do not write for the user. |
| | Both | Write dialogue and actions for both your character and the user. |
| Intimacy | Platonic | Keep the tone platonic. Avoid romantic or sexual content. |
| | Romantic | Keep the tone romantic and emotionally intimate. |
| | Sexual | Sexual content is permitted. |
| | Explicit | Explicit sexual content is permitted. Do not fade to black. |
| Story Pacing | Slow | Use a slow pace — linger on details, emotions, and atmosphere. |
| | Fast | Use a fast pace — keep things moving, minimize dwelling. |
| Narration vs Dialogue | Narration | Focus on narration and description over dialogue. |
| | Balanced | Balance narration and dialogue equally. |
| | Dialogue | Focus on dialogue over narration and description. |

Default on any field = nothing injected for that field. A live preview at the bottom of the panel shows the exact string that'll be sent.

---

## Install

### Via SillyTavern (recommended)

1. In ST, go to **Extensions** → **Install extension**
2. Paste: `https://github.com/bumyann/SillyTavern-Response-Instructions`
3. Click **Save** — ST installs it automatically
4. Enable it in the Extensions list

### Manual

1. Download this repo as a ZIP (Code → Download ZIP)
2. Extract into `SillyTavern/public/extensions/third-party/`
3. Make sure the folder is named `saucepan-seasoning` and contains `manifest.json`, `index.js`, and `style.css`
4. Reload ST and enable the extension under Extensions

---

## Usage

Both features live in a bar just above the chat input.

**Response Instructions:**

- Click the 📜 button to open the panel
- Pick your settings in Simple mode, or switch to Custom for freeform input
- Toggle **ON** — green dot appears on the button, instructions inject on next send
- 📁 → preset library · 🗑 → clear · ✕ → close panel

**Write For Me:**

- Click the ✦ button to open the panel
- Optionally add a direction, hit **Generate**
- Browse drafts with ← → · bookmark one with 🔖 to save it
- **Use this** → drops the draft into chat input ready to send

---

## Troubleshooting

If instructions don't seem to be reaching the AI:

1. Open the prompt itemization on the AI's response (small icon on the message) and search for `[OOC SYSTEM DIRECTIVE`
2. If it's missing, check the browser console for `[SS] /inject failed:` errors
3. Confirm the green dot is showing on the Instructions button before sending

---

## Credits

Feature design by [SaucepanAI](https://saucepan.ai). SillyTavern port by [bumyann](https://github.com/bumyann).

---

## License

MIT
