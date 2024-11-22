// Global registry of keyboard shortcuts
const keyboardShortcuts = new Map();
let activeDialog = null;

// Global keydown event handler
function globalKeydownHandler(e) {
    // Abort if key modifiers are pressed.
    if (e.ctrlKey || e.altKey || e.metaKey) {
        return;
    }

    const shortcut = (activeDialog && e.code === 'Escape') ? { callback: closeKeyboardShortcutsDialog } :
        keyboardShortcuts.get(e.code);

    if (shortcut) {
        // Prevent multiple triggers
        e.preventDefault();
        e.stopPropagation();

        shortcut.callback(e);
    }
}

document.addEventListener('keydown', globalKeydownHandler);

function bindKey(key, callback, description = 'Unnamed action') {
    keyboardShortcuts.set(key, {
        callback,
        description
    });

    return keyboardShortcuts.get(key);
}

function closeKeyboardShortcutsDialog() {
    if (activeDialog) {
        activeDialog.overlay.remove();
        activeDialog.dialog.remove();
        activeDialog = null;
    }
}

// Keyboard Shortcut Dialog Generator
function showKeyboardShortcutsDialog() {
    // Prevent multiple dialogs
    if (activeDialog) {
        closeKeyboardShortcutsDialog();
        return;
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.classList.add('shortcut-overlay');

    // Create dialog
    const dialog = document.createElement('div');
    dialog.classList.add('card', 'shortcut-dialog');

    // Generate table rows dynamically from registered shortcuts
    const shortcutRows = Array.from(keyboardShortcuts.entries())
        .filter(([key, { description }]) => description !== null)
        .map(([key, { description }]) => `
            <tr>
                <td><kbd>${getPrettyKeyName(key)}</kbd></td>
                <td>${description}</td>
            </tr>
        `)
        .join('');

    // Dialog content
    dialog.innerHTML = `
        <div class="card-header">
            <h5 class="card-title mb-0">Keyboard Shortcuts</h5>
        </div>
        <div class="card-body">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Key</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${shortcutRows}
                </tbody>
            </table>
        </div>
        <div class="card-footer text-center">
            <button class="btn btn-secondary close-dialog">Close</button>
        </div>
    `;

    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    // Store active dialog reference
    activeDialog = { overlay, dialog };

    // Close on overlay click
    overlay.addEventListener('click', closeKeyboardShortcutsDialog);

    // Close on close button click
    dialog.querySelector('.close-dialog').addEventListener('click', closeKeyboardShortcutsDialog);
}

// Helper to convert key codes to more readable names
function getPrettyKeyName(key) {
    const keyMappings = {
        'ArrowDown': '↓',
        'ArrowUp': '↑',
        'ArrowRight': '→',
        'ArrowLeft': '←',
        'Escape': 'Esc',
        'Slash': '?'
    };

    return keyMappings[key] || key.replace('Key', '');
}