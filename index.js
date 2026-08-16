(function () {
    'use strict';

    const EXT_NAME = 'saucepan-seasoning';
    const EXT_VERSION = '3.0.0';
    const INJECT_ID = 'response_instructions';

    console.log(`[SS] Saucepan Seasoning v${EXT_VERSION} loading…`);

    // ── Simple mode chip definitions ──────────────────────────────────────────
    const SIMPLE_FIELDS = [
        {
            key: 'length',
            label: 'Length',
            options: [
                { value: 'short',  label: 'Short',  inject: 'Keep your response brief and concise.' },
                { value: 'medium', label: 'Medium', inject: 'Write a moderate length response.' },
                { value: 'long',   label: 'Long',   inject: 'Write a long, detailed response.' },
                { value: 'essay',  label: 'Essay',  inject: 'Write a lengthy, essay-style response with thorough detail.' },
                { value: 'ramble', label: 'Ramble', inject: 'Write a lengthy, rambling response — don\'t cut yourself short.' },
            ],
        },
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'first',   label: '1st Person', inject: 'Narrate in first person.' },
                { value: 'second',  label: '2nd Person', inject: 'Narrate in second person, addressing the user as "you".' },
                { value: 'third',   label: '3rd Person', inject: 'Narrate in third person.' },
                { value: 'texting', label: 'Texting',    inject: 'Write in a casual text messaging style — short messages, no prose.' },
            ],
        },
        {
            key: 'speak_for',
            label: 'Speak For',
            options: [
                { value: 'companion', label: 'Companion only', inject: 'Only write dialogue and actions for your character. Do not write for the user.' },
                { value: 'both',      label: 'Both',           inject: 'Write dialogue and actions for both your character and the user.' },
            ],
        },
        {
            key: 'intimacy',
            label: 'Intimacy',
            options: [
                { value: 'platonic',  label: 'Platonic',  inject: 'Keep the tone platonic. Avoid romantic or sexual content.' },
                { value: 'romantic',  label: 'Romantic',  inject: 'Keep the tone romantic and emotionally intimate.' },
                { value: 'sexual',    label: 'Sexual',    inject: 'Sexual content is permitted.' },
                { value: 'explicit',  label: 'Explicit',  inject: 'Explicit sexual content is permitted. Do not fade to black.' },
            ],
        },
        {
            key: 'pacing',
            label: 'Story Pacing',
            options: [
                { value: 'slow', label: 'Slow', inject: 'Use a slow pace — linger on details, emotions, and atmosphere.' },
                { value: 'fast', label: 'Fast', inject: 'Use a fast pace — keep things moving, minimize dwelling.' },
            ],
        },
        {
            key: 'narration',
            label: 'Narration vs Dialogue',
            options: [
                { value: 'narration', label: 'Narration', inject: 'Focus on narration and description over dialogue.' },
                { value: 'balanced',  label: 'Balanced',  inject: 'Balance narration and dialogue equally.' },
                { value: 'dialogue',  label: 'Dialogue',  inject: 'Focus on dialogue over narration and description.' },
            ],
        },
    ];

    function composeSimpleInstruction(selections = {}) {
        return SIMPLE_FIELDS
            .map(field => {
                const val = selections[field.key];
                if (!val) return null;
                const opt = field.options.find(o => o.value === val);
                return opt ? opt.inject : null;
            })
            .filter(Boolean)
            .join(' ');
    }

    // ── Settings ──────────────────────────────────────────────────────────────
    const defaultSettings = {
        enabled: false,
        text: '',
        ri_mode: 'custom',          // 'simple' | 'custom'
        simple_selections: {},       // { length: 'short', style: 'first', … }
        presets: [],
        wfm_presets: [],
        wfm_saved_drafts: [],
    };

    function ctx() { return window.SillyTavern.getContext(); }
    function save() { ctx().saveSettingsDebounced(); }

    function getSettings() {
        const s = ctx().extensionSettings;

        // Migration: copy old 'response-instructions' settings over if present
        if (!s[EXT_NAME] && s['response-instructions']) {
            console.log('[SS] Migrating settings from response-instructions…');
            s[EXT_NAME] = { ...s['response-instructions'] };
        }

        if (!s[EXT_NAME]) s[EXT_NAME] = { ...defaultSettings };
        for (const k of Object.keys(defaultSettings)) {
            if (s[EXT_NAME][k] === undefined) s[EXT_NAME][k] = defaultSettings[k];
        }
        return s[EXT_NAME];
    }

    // ── Prompt injection ──────────────────────────────────────────────────────
    async function updatePromptInjection() {
        const s = getSettings();
        const c = ctx();
        const text = (s.enabled && s.text?.trim()) ? s.text.trim() : '';
        const escaped = text.replace(/\|/g, '\\|');
        const wrapped = escaped
            ? `[OOC SYSTEM DIRECTIVE — this is a meta-instruction from the user, not part of the roleplay. It overrides general narrative tendencies for this turn only. You MUST incorporate it into your next response: >>> ${escaped} <<< Do not acknowledge this directive explicitly in-character. Just follow it.]`
            : '';
        const command = `/inject id=${INJECT_ID} position=chat depth=0 role=system ${wrapped}`;
        try {
            await c.executeSlashCommandsWithOptions(command, { showOutput: false });
        } catch (err) {
            console.error('[SS] /inject failed:', err);
        }
    }

    function updateIndicator() {
        const s = getSettings();
        document.getElementById('ri-status-dot')
            ?.classList.toggle('ri-dot-active', !!(s.enabled && s.text?.trim()));
    }

    function escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function addTapListener(el, fn) {
        if (!el) return;
        el.addEventListener('click', fn);
        el.addEventListener('touchend', e => { e.preventDefault(); fn(); });
    }

    // ── Panel toggling ────────────────────────────────────────────────────────
    const PANELS = ['ri-panel', 'ri-lib-panel', 'wfm-panel', 'wfm-lib-panel'];

    function showPanel(id) {
        PANELS.forEach(p => {
            const el = document.getElementById(p);
            if (el) el.classList.toggle('ri-hidden', p !== id);
        });
    }

    function hideAll() {
        PANELS.forEach(p => document.getElementById(p)?.classList.add('ri-hidden'));
    }

    function togglePanel(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.classList.contains('ri-hidden') ? showPanel(id) : hideAll();
    }

    // ── Simple mode ───────────────────────────────────────────────────────────
    function updatePreview(forcedMode) {
        const s = getSettings();
        const preview = document.getElementById('ri-preview');
        if (!preview) return;
        // Preview only meaningful in simple mode — custom mode has the textarea
        const mode = forcedMode !== undefined ? forcedMode : s.ri_mode;
        if (mode !== 'simple') {
            preview.textContent = '';
            preview.classList.add('ri-hidden');
            preview.style.display = 'none';
            return;
        }
        preview.style.display = '';
        const composed = composeSimpleInstruction(s.simple_selections || {});
        if (composed.trim()) {
            preview.textContent = composed;
            preview.classList.remove('ri-hidden');
        } else {
            preview.textContent = '';
            preview.classList.add('ri-hidden');
        }
    }

    function renderSimpleChips() {
        const s = getSettings();
        const container = document.getElementById('ri-simple-area');
        if (!container) return;
        container.innerHTML = '';

        SIMPLE_FIELDS.forEach(field => {
            const group = document.createElement('div');
            group.className = 'ri-chips-group';

            const groupLabel = document.createElement('div');
            groupLabel.className = 'ri-chips-label';
            groupLabel.textContent = field.label;
            group.appendChild(groupLabel);

            const chips = document.createElement('div');
            chips.className = 'ri-chips-row';

            field.options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'ri-chip';
                btn.textContent = opt.label;
                btn.dataset.field = field.key;
                btn.dataset.value = opt.value;
                if ((s.simple_selections || {})[field.key] === opt.value) {
                    btn.classList.add('ri-chip-active');
                }
                btn.addEventListener('click', async () => {
                    if (!s.simple_selections) s.simple_selections = {};
                    // Toggle off if already active
                    if (s.simple_selections[field.key] === opt.value) {
                        delete s.simple_selections[field.key];
                    } else {
                        s.simple_selections[field.key] = opt.value;
                    }
                    // Update chip active states for this field
                    chips.querySelectorAll('.ri-chip').forEach(c => {
                        c.classList.toggle('ri-chip-active', c.dataset.value === s.simple_selections[field.key]);
                    });
                    // Sync composed string to s.text so injection + presets work normally
                    s.text = composeSimpleInstruction(s.simple_selections);
                    updatePreview();
                    await updatePromptInjection();
                    updateIndicator();
                    save();
                });
                chips.appendChild(btn);
            });

            group.appendChild(chips);
            container.appendChild(group);
        });
    }

    function switchMode(mode) {
        const s = getSettings();
        s.ri_mode = mode;
        save();

        const simpleArea = document.getElementById('ri-simple-area');
        const customArea = document.getElementById('ri-custom-area');
        const simpleModeBtn = document.getElementById('ri-mode-simple');
        const customModeBtn = document.getElementById('ri-mode-custom');

        // Belt-and-suspenders: class + inline style, because ST's flex container
        // can override class-only display:none in some theme configs
        if (simpleArea) {
            if (mode === 'simple') {
                simpleArea.classList.remove('ri-hidden');
                simpleArea.style.display = '';
            } else {
                simpleArea.classList.add('ri-hidden');
                simpleArea.style.display = 'none';
            }
        }
        if (customArea) {
            if (mode === 'custom') {
                customArea.classList.remove('ri-hidden');
                customArea.style.display = '';
            } else {
                customArea.classList.add('ri-hidden');
                customArea.style.display = 'none';
            }
        }

        if (simpleModeBtn) simpleModeBtn.classList.toggle('ri-mode-active', mode === 'simple');
        if (customModeBtn) customModeBtn.classList.toggle('ri-mode-active', mode === 'custom');

        if (mode === 'simple') {
            renderSimpleChips();
            s.text = composeSimpleInstruction(s.simple_selections || {});
        }

        updatePreview(mode);
    }

    // ── RI Preset Library ─────────────────────────────────────────────────────
    function renderPresets() {
        const s = getSettings();
        const list = document.getElementById('ri-preset-list');
        if (!list) return;
        list.innerHTML = '';
        if (!s.presets.length) {
            list.innerHTML = '<div class="ri-no-presets">No saved presets yet.</div>';
            return;
        }
        s.presets.forEach((preset, idx) => {
            const item = document.createElement('div');
            item.className = 'ri-preset-item';
            item.innerHTML = `
                <div class="ri-preset-name-row">
                    <span class="ri-preset-name">${escapeHtml(preset.name)}</span>
                    <button class="ri-preset-rename ri-icon-btn" data-idx="${idx}" title="Rename">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </div>
                <div class="ri-preset-preview">${escapeHtml(preset.text.slice(0, 80))}${preset.text.length > 80 ? '…' : ''}</div>
                <div class="ri-preset-actions">
                    <button class="ri-preset-load menu_button" data-idx="${idx}">Load</button>
                    <button class="ri-preset-delete menu_button ri-btn-danger" data-idx="${idx}">Delete</button>
                </div>`;
            list.appendChild(item);
        });
        list.querySelectorAll('.ri-preset-rename').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = getSettings().presets[parseInt(btn.dataset.idx)];
                if (!preset) return;
                const newName = prompt('Rename preset:', preset.name);
                if (newName?.trim()) { preset.name = newName.trim(); save(); renderPresets(); }
            });
        });
        list.querySelectorAll('.ri-preset-load').forEach(btn => {
            btn.addEventListener('click', async () => {
                const s = getSettings();
                const preset = s.presets[parseInt(btn.dataset.idx)];
                if (!preset) return;
                // Always load into custom mode — presets store plain strings
                s.text = preset.text;
                s.ri_mode = 'custom';
                const ta = document.getElementById('ri-textarea');
                if (ta) ta.value = preset.text;
                switchMode('custom');
                await updatePromptInjection(); updateIndicator(); save();
                showPanel('ri-panel');
            });
        });
        list.querySelectorAll('.ri-preset-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                getSettings().presets.splice(parseInt(btn.dataset.idx), 1);
                save(); renderPresets();
            });
        });
    }

    function saveRiPreset() {
        const s = getSettings();
        const text = s.text?.trim();
        if (!text) { window.toastr?.warning('Nothing to save — instructions are empty.'); return; }
        const nameInput = document.getElementById('ri-preset-name-input');
        const name = nameInput?.value?.trim() || `Preset ${s.presets.length + 1}`;
        s.presets.push({ name, text });
        if (nameInput) nameInput.value = '';
        save(); renderPresets();
        window.toastr?.success(`Saved "${name}"!`);
    }

    // ── WFM Preset Library ────────────────────────────────────────────────────
    function renderWfmPresets() {
        const s = getSettings();
        const list = document.getElementById('wfm-preset-list');
        if (!list) return;
        list.innerHTML = '';
        if (!s.wfm_presets.length) {
            list.innerHTML = '<div class="ri-no-presets">No saved presets yet.</div>';
            return;
        }
        s.wfm_presets.forEach((preset, idx) => {
            const item = document.createElement('div');
            item.className = 'ri-preset-item';
            item.innerHTML = `
                <div class="ri-preset-name-row">
                    <span class="ri-preset-name">${escapeHtml(preset.name)}</span>
                    <button class="wfm-preset-rename ri-icon-btn" data-idx="${idx}" title="Rename">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                </div>
                <div class="ri-preset-preview">${escapeHtml(preset.text.slice(0, 80))}${preset.text.length > 80 ? '…' : ''}</div>
                <div class="ri-preset-actions">
                    <button class="wfm-preset-load menu_button" data-idx="${idx}">Load</button>
                    <button class="wfm-preset-delete menu_button ri-btn-danger" data-idx="${idx}">Delete</button>
                </div>`;
            list.appendChild(item);
        });
        list.querySelectorAll('.wfm-preset-rename').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = getSettings().wfm_presets[parseInt(btn.dataset.idx)];
                if (!preset) return;
                const newName = prompt('Rename preset:', preset.name);
                if (newName?.trim()) { preset.name = newName.trim(); save(); renderWfmPresets(); }
            });
        });
        list.querySelectorAll('.wfm-preset-load').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = getSettings().wfm_presets[parseInt(btn.dataset.idx)];
                if (!preset) return;
                const ta = document.getElementById('wfm-instruction');
                if (ta) ta.value = preset.text;
                showPanel('wfm-panel');
            });
        });
        list.querySelectorAll('.wfm-preset-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                getSettings().wfm_presets.splice(parseInt(btn.dataset.idx), 1);
                save(); renderWfmPresets();
            });
        });
    }

    function saveWfmPreset() {
        const s = getSettings();
        const text = document.getElementById('wfm-instruction')?.value?.trim();
        if (!text) { window.toastr?.warning('Nothing to save — instruction is empty.'); return; }
        const nameInput = document.getElementById('wfm-preset-name-input');
        const name = nameInput?.value?.trim() || `Preset ${s.wfm_presets.length + 1}`;
        s.wfm_presets.push({ name, text });
        if (nameInput) nameInput.value = '';
        save(); renderWfmPresets();
        window.toastr?.success(`Saved "${name}"!`);
    }

    // ── Write For Me ──────────────────────────────────────────────────────────
    let wfmDrafts = [];
    let wfmCurrentDraft = 0;
    let wfmGenerating = false;
    let wfmActiveTab = 'draft'; // 'draft' | 'saved'

    function switchWfmTab(tab) {
        wfmActiveTab = tab;
        const draftTab = document.getElementById('wfm-tab-draft');
        const savedTab = document.getElementById('wfm-tab-saved');
        const draftArea = document.getElementById('wfm-draft-area');
        const savedArea = document.getElementById('wfm-saved-area');

        if (draftTab) draftTab.classList.toggle('wfm-tab-active', tab === 'draft');
        if (savedTab) savedTab.classList.toggle('wfm-tab-active', tab === 'saved');
        if (draftArea) draftArea.classList.toggle('ri-hidden', tab !== 'draft');
        if (savedArea) savedArea.classList.toggle('ri-hidden', tab !== 'saved');

        if (tab === 'saved') renderSavedDrafts();
    }

    function saveDraft() {
        const s = getSettings();
        const editor = document.getElementById('wfm-editor');
        const text = editor?.value?.trim();
        if (!text) { window.toastr?.warning('Nothing to save — draft is empty.'); return; }
        if (!s.wfm_saved_drafts) s.wfm_saved_drafts = [];
        s.wfm_saved_drafts.unshift({ text, saved_at: Date.now() });
        save();
        window.toastr?.success('Draft saved!');
        // Flash the bookmark button
        const btn = document.getElementById('wfm-save-draft-btn');
        if (btn) {
            btn.querySelector('i')?.classList.replace('fa-regular', 'fa-solid');
            setTimeout(() => btn.querySelector('i')?.classList.replace('fa-solid', 'fa-regular'), 1000);
        }
    }

    function renderSavedDrafts() {
        const s = getSettings();
        const list = document.getElementById('wfm-saved-list');
        if (!list) return;
        list.innerHTML = '';
        if (!s.wfm_saved_drafts?.length) {
            list.innerHTML = '<div class="ri-no-presets">No saved drafts yet.<br>Hit 🔖 on a draft to save it.</div>';
            return;
        }
        s.wfm_saved_drafts.forEach((draft, idx) => {
            const item = document.createElement('div');
            item.className = 'ri-preset-item';
            const preview = draft.text.slice(0, 100) + (draft.text.length > 100 ? '…' : '');
            item.innerHTML = `
                <div class="ri-preset-preview">${escapeHtml(preview)}</div>
                <div class="ri-preset-actions">
                    <button class="wfm-saved-load menu_button" data-idx="${idx}">Load</button>
                    <button class="wfm-saved-delete menu_button ri-btn-danger" data-idx="${idx}">Delete</button>
                </div>`;
            list.appendChild(item);
        });
        list.querySelectorAll('.wfm-saved-load').forEach(btn => {
            btn.addEventListener('click', () => {
                const draft = getSettings().wfm_saved_drafts[parseInt(btn.dataset.idx)];
                if (!draft) return;
                // Push into drafts array and switch to draft tab
                wfmDrafts.push(draft.text);
                wfmCurrentDraft = wfmDrafts.length - 1;
                updateDraftNav();
                switchWfmTab('draft');
            });
        });
        list.querySelectorAll('.wfm-saved-delete').forEach(btn => {
            btn.addEventListener('click', () => {
                getSettings().wfm_saved_drafts.splice(parseInt(btn.dataset.idx), 1);
                save(); renderSavedDrafts();
            });
        });
    }

    function commitWfmDraft() {
        const editor = document.getElementById('wfm-editor');
        const stTextarea = document.getElementById('send_textarea');
        if (!editor || !stTextarea) return;
        stTextarea.value = editor.value;
        stTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        hideAll();
    }

    function updateDraftNav() {
        const counter = document.getElementById('wfm-draft-counter');
        const prevBtn = document.getElementById('wfm-prev-draft');
        const nextBtn = document.getElementById('wfm-next-draft');
        const saveBtn = document.getElementById('wfm-save-draft-btn');
        if (!counter) return;
        if (!wfmDrafts.length) {
            counter.textContent = 'No drafts';
            if (prevBtn) prevBtn.disabled = true;
            if (nextBtn) nextBtn.disabled = true;
            if (saveBtn) saveBtn.disabled = true;
            return;
        }
        counter.textContent = `${wfmCurrentDraft + 1} / ${wfmDrafts.length}`;
        if (prevBtn) prevBtn.disabled = wfmCurrentDraft <= 0;
        if (nextBtn) nextBtn.disabled = wfmCurrentDraft >= wfmDrafts.length - 1;
        if (saveBtn) saveBtn.disabled = false;
        const editor = document.getElementById('wfm-editor');
        if (editor) editor.value = wfmDrafts[wfmCurrentDraft];
    }

    async function generateWfmDraft() {
        if (wfmGenerating) return;
        const c = ctx();
        if (!c.generateRaw) { window.toastr?.error('generateRaw not available.'); return; }

        const instruction = document.getElementById('wfm-instruction')?.value?.trim() || '';
        const charName = c.name2 || 'the character';
        const userName = c.name1 || 'User';

        const recentMessages = (c.chat || []).slice(-10).map(m =>
            `${m.is_user ? userName : charName}: ${m.mes}`
        ).join('\n');

        let prompt = `[Write ${userName}'s next message in this roleplay with ${charName}. Write ONLY the message content, no labels or preamble.`;
        if (instruction) prompt += ` Instruction: ${instruction}.`;
        prompt += `]\n\n`;
        if (recentMessages) prompt += `Recent conversation:\n${recentMessages}\n\n`;
        prompt += `${userName}:`;

        wfmGenerating = true;
        const genBtn = document.getElementById('wfm-generate-btn');
        if (genBtn) { genBtn.disabled = true; genBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }

        try {
            const result = await c.generateRaw({
                prompt,
                quietToLoud: false,
                instructOverride: false,
                systemPrompt: `You are helping ${userName} write their next message in a roleplay with ${charName}. Write ONLY the message content, no labels or preamble.`,
            });
            const text = (typeof result === 'string' ? result : result?.text || '').trim();
            if (text) {
                wfmDrafts.push(text);
                wfmCurrentDraft = wfmDrafts.length - 1;
                updateDraftNav();
            } else {
                window.toastr?.warning('Generation returned empty — try again.');
            }
        } catch (err) {
            console.error('[SS] WFM error:', err?.message || err);
            window.toastr?.error(`Generation failed: ${err?.message || 'unknown error'}`);
        } finally {
            wfmGenerating = false;
            if (genBtn) { genBtn.disabled = false; genBtn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate'; }
        }
    }

    // ── UI Injection ──────────────────────────────────────────────────────────
    function injectUI() {
        if (document.getElementById('ri-bar')) return;
        const sendForm = document.getElementById('send_form');
        if (!sendForm) { console.error('[SS] #send_form not found'); return; }

        const s = getSettings();

        // ── Bar ──
        const bar = document.createElement('div');
        bar.id = 'ri-bar';
        bar.className = 'ri-bar';
        bar.innerHTML = `
            <button class="ri-bar-btn" id="ri-bar-ri-btn" title="Response Instructions">
                <i class="fa-solid fa-scroll"></i>
                <span id="ri-status-dot" class="ri-status-dot"></span>
            </button>
            <div class="ri-bar-divider"></div>
            <button class="ri-bar-btn" id="ri-bar-wfm-btn" title="Write For Me">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
            </button>`;
        sendForm.parentNode.insertBefore(bar, sendForm);

        // ── RI Panel ──
        const riPanel = document.createElement('div');
        riPanel.id = 'ri-panel';
        riPanel.className = 'ri-panel ri-hidden';
        riPanel.innerHTML = `
            <div class="ri-panel-header">
                <span class="ri-panel-title"><i class="fa-solid fa-scroll"></i> Response Instructions</span>
                <div class="ri-panel-controls">
                    <label class="ri-toggle-label" title="Enable/disable">
                        <input type="checkbox" id="ri-toggle" ${s.enabled ? 'checked' : ''}>
                        <span class="ri-toggle-slider"></span>
                    </label>
                    <button id="ri-library-btn" class="ri-icon-btn" title="Presets">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button id="ri-clear-btn" class="ri-icon-btn" title="Clear">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                    <button id="ri-close-btn" class="ri-icon-btn" title="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="ri-mode-toggle">
                <button id="ri-mode-simple" class="ri-mode-btn ${s.ri_mode === 'simple' ? 'ri-mode-active' : ''}">Simple</button>
                <button id="ri-mode-custom" class="ri-mode-btn ${s.ri_mode !== 'simple' ? 'ri-mode-active' : ''}">Custom</button>
            </div>
            <div id="ri-simple-area" class="${s.ri_mode !== 'simple' ? 'ri-hidden' : ''}"></div>
            <div id="ri-custom-area" class="${s.ri_mode === 'simple' ? 'ri-hidden' : ''}">
                <textarea id="ri-textarea" class="ri-textarea"
                    placeholder="Write response instructions here… No character limit. Injected via /inject for the next reply."
                >${escapeHtml(s.text || '')}</textarea>
            </div>
            <p id="ri-preview" class="ri-preview ${(!s.text?.trim()) ? 'ri-hidden' : ''}">${escapeHtml(s.text || '')}</p>`;
        bar.parentNode.insertBefore(riPanel, bar);

        // ── RI Library Panel ──
        const riLibPanel = document.createElement('div');
        riLibPanel.id = 'ri-lib-panel';
        riLibPanel.className = 'ri-panel ri-hidden';
        riLibPanel.innerHTML = `
            <div class="ri-panel-header">
                <span class="ri-panel-title"><i class="fa-solid fa-folder-open"></i> RI Presets</span>
                <div class="ri-panel-controls">
                    <button id="ri-lib-back-btn" class="ri-icon-btn" title="Back">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <button id="ri-lib-close-btn" class="ri-icon-btn" title="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="ri-lib-save-row">
                <input type="text" id="ri-preset-name-input" class="text_pole ri-name-input" placeholder="Preset name…" />
                <button id="ri-save-preset-btn" class="ri-icon-btn" title="Save current instructions">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>
            </div>
            <div id="ri-preset-list" class="ri-preset-list"></div>`;
        bar.parentNode.insertBefore(riLibPanel, bar);

        // ── WFM Panel ──
        const wfmPanel = document.createElement('div');
        wfmPanel.id = 'wfm-panel';
        wfmPanel.className = 'ri-panel ri-hidden wfm-panel';
        wfmPanel.innerHTML = `
            <div class="ri-panel-header">
                <span class="ri-panel-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Write For Me</span>
                <div class="ri-panel-controls">
                    <button id="wfm-lib-btn" class="ri-icon-btn" title="Instruction presets">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    <button id="wfm-close-btn" class="ri-icon-btn" title="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="wfm-tab-bar">
                <button id="wfm-tab-draft" class="wfm-tab wfm-tab-active">Draft</button>
                <button id="wfm-tab-saved" class="wfm-tab">Saved</button>
            </div>
            <div id="wfm-draft-area">
                <div class="wfm-section-label" style="margin-top:4px">Your message</div>
                <textarea id="wfm-editor" class="ri-textarea wfm-editor"
                    placeholder="Generated message appears here. You can also type or edit directly…"></textarea>
                <div class="wfm-draft-nav">
                    <button id="wfm-prev-draft" class="ri-icon-btn" disabled>
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <span id="wfm-draft-counter" class="wfm-draft-counter">No drafts</span>
                    <button id="wfm-next-draft" class="ri-icon-btn" disabled>
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                    <button id="wfm-save-draft-btn" class="ri-icon-btn" title="Save draft" disabled>
                        <i class="fa-regular fa-bookmark"></i>
                    </button>
                </div>
                <div class="wfm-section-label">Instruction</div>
                <textarea id="wfm-instruction" class="ri-textarea wfm-instruction"
                    placeholder="e.g. 'act shy and nervous', 'confess my feelings'…"></textarea>
                <div class="wfm-footer">
                    <button id="wfm-generate-btn" class="menu_button wfm-btn-generate">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> Generate
                    </button>
                    <button id="wfm-use-btn" class="menu_button wfm-btn-use">
                        <i class="fa-solid fa-check"></i> Use this
                    </button>
                </div>
            </div>
            <div id="wfm-saved-area" class="ri-hidden">
                <div id="wfm-saved-list" class="ri-preset-list" style="margin-top:6px"></div>
            </div>`;
        bar.parentNode.insertBefore(wfmPanel, bar);

        // ── WFM Library Panel ──
        const wfmLibPanel = document.createElement('div');
        wfmLibPanel.id = 'wfm-lib-panel';
        wfmLibPanel.className = 'ri-panel ri-hidden';
        wfmLibPanel.innerHTML = `
            <div class="ri-panel-header">
                <span class="ri-panel-title"><i class="fa-solid fa-folder-open"></i> WFM Presets</span>
                <div class="ri-panel-controls">
                    <button id="wfm-lib-back-btn" class="ri-icon-btn" title="Back">
                        <i class="fa-solid fa-arrow-left"></i>
                    </button>
                    <button id="wfm-lib-close-btn" class="ri-icon-btn" title="Close">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>
            <div class="ri-lib-save-row">
                <input type="text" id="wfm-preset-name-input" class="text_pole ri-name-input" placeholder="Preset name…" />
                <button id="wfm-save-preset-btn" class="ri-icon-btn" title="Save current instruction">
                    <i class="fa-solid fa-floppy-disk"></i>
                </button>
            </div>
            <div id="wfm-preset-list" class="ri-preset-list"></div>`;
        bar.parentNode.insertBefore(wfmLibPanel, bar);

        // ── Wire up bar ──
        addTapListener(document.getElementById('ri-bar-ri-btn'), () => {
            if (document.getElementById('ri-panel').classList.contains('ri-hidden')) {
                showPanel('ri-panel');
                if (s.ri_mode === 'simple') renderSimpleChips();
                updatePreview();
            } else {
                hideAll();
            }
        });
        addTapListener(document.getElementById('ri-bar-wfm-btn'), () => {
            const stTextarea = document.getElementById('send_textarea');
            const editor = document.getElementById('wfm-editor');
            if (editor && stTextarea?.value?.trim() && !editor.value) editor.value = stTextarea.value;
            if (document.getElementById('wfm-panel').classList.contains('ri-hidden')) {
                showPanel('wfm-panel'); updateDraftNav();
            } else {
                hideAll();
            }
        });

        // ── Wire up RI panel ──
        const riTextarea = document.getElementById('ri-textarea');
        let debounceTimer = null;
        riTextarea.addEventListener('input', () => {
            s.text = riTextarea.value;
            updateIndicator(); save(); updatePreview();
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => updatePromptInjection(), 400);
        });
        document.getElementById('ri-toggle').addEventListener('change', async e => {
            s.enabled = e.target.checked;
            await updatePromptInjection(); updateIndicator(); save();
        });
        document.getElementById('ri-clear-btn').addEventListener('click', async () => {
            riTextarea.value = ''; s.text = ''; s.enabled = false;
            if (!s.simple_selections) s.simple_selections = {};
            else Object.keys(s.simple_selections).forEach(k => delete s.simple_selections[k]);
            document.getElementById('ri-toggle').checked = false;
            if (s.ri_mode === 'simple') renderSimpleChips();
            updatePreview();
            await updatePromptInjection(); updateIndicator(); save();
        });
        document.getElementById('ri-close-btn').addEventListener('click', hideAll);
        document.getElementById('ri-library-btn').addEventListener('click', () => {
            renderPresets(); showPanel('ri-lib-panel');
        });

        // Mode toggle
        document.getElementById('ri-mode-simple').addEventListener('click', () => switchMode('simple'));
        document.getElementById('ri-mode-custom').addEventListener('click', () => switchMode('custom'));

        // ── Wire up RI library panel ──
        document.getElementById('ri-lib-back-btn').addEventListener('click', () => showPanel('ri-panel'));
        document.getElementById('ri-lib-close-btn').addEventListener('click', hideAll);
        document.getElementById('ri-save-preset-btn').addEventListener('click', saveRiPreset);

        // ── Wire up WFM panel ──
        document.getElementById('wfm-close-btn').addEventListener('click', hideAll);
        document.getElementById('wfm-generate-btn').addEventListener('click', generateWfmDraft);
        document.getElementById('wfm-use-btn').addEventListener('click', commitWfmDraft);
        document.getElementById('wfm-save-draft-btn').addEventListener('click', saveDraft);
        document.getElementById('wfm-lib-btn').addEventListener('click', () => {
            renderWfmPresets(); showPanel('wfm-lib-panel');
        });
        document.getElementById('wfm-tab-draft').addEventListener('click', () => switchWfmTab('draft'));
        document.getElementById('wfm-tab-saved').addEventListener('click', () => switchWfmTab('saved'));
        document.getElementById('wfm-prev-draft').addEventListener('click', () => {
            if (wfmCurrentDraft > 0) { wfmCurrentDraft--; updateDraftNav(); }
        });
        document.getElementById('wfm-next-draft').addEventListener('click', () => {
            if (wfmCurrentDraft < wfmDrafts.length - 1) { wfmCurrentDraft++; updateDraftNav(); }
        });

        // ── Wire up WFM library panel ──
        document.getElementById('wfm-lib-back-btn').addEventListener('click', () => showPanel('wfm-panel'));
        document.getElementById('wfm-lib-close-btn').addEventListener('click', hideAll);
        document.getElementById('wfm-save-preset-btn').addEventListener('click', saveWfmPreset);

        // Init simple chips if in simple mode
        if (s.ri_mode === 'simple') renderSimpleChips();
        updateIndicator();
        updatePreview();
        console.log('[SS] UI injected successfully');
    }

    // ── Boot ──────────────────────────────────────────────────────────────────
    async function tryInit() {
        if (!window.SillyTavern?.getContext) { setTimeout(tryInit, 200); return; }
        const c = ctx();
        if (!c.extensionSettings[EXT_NAME]) c.extensionSettings[EXT_NAME] = {};
        c.extensionSettings[EXT_NAME] = { ...defaultSettings, ...c.extensionSettings[EXT_NAME] };

        if (c.eventSource && c.eventTypes) {
            c.eventSource.on(c.eventTypes.APP_READY, () => injectUI());
            if (c.eventTypes.CHAT_CHANGED) {
                c.eventSource.on(c.eventTypes.CHAT_CHANGED, () => {
                    setTimeout(() => updatePromptInjection(), 300);
                });
            }
        }

        await updatePromptInjection();
        setTimeout(() => { if (!document.getElementById('ri-bar')) injectUI(); }, 500);
        setTimeout(() => { if (!document.getElementById('ri-bar')) injectUI(); }, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', tryInit);
    } else {
        tryInit();
    }

})();
