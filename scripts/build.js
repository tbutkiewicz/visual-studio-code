const fs = require('fs');
const path = require('path');
const generate = require('./generate');

const THEME_DIR = path.join(__dirname, '..', 'theme');

if (!fs.existsSync(THEME_DIR)) {
    fs.mkdirSync(THEME_DIR);
}

/**
 * Produces a copy of the theme with all italic fontStyle declarations removed.
 * Handles fontStyle values that may combine styles (e.g. "bold italic") by
 * stripping only the italic token and preserving the rest.
 */
const removeItalics = (theme) => {
    const clone = JSON.parse(JSON.stringify(theme));

    clone.name = 'Omni (No Italics)';

    const stripItalic = (settings) => {
        if (!settings || typeof settings.fontStyle !== 'string') return;

        const styles = settings.fontStyle
            .split(/\s+/)
            .filter((s) => s && s.toLowerCase() !== 'italic');

        if (styles.length === 0) {
            delete settings.fontStyle;
        } else {
            settings.fontStyle = styles.join(' ');
        }
    };

    if (Array.isArray(clone.tokenColors)) {
        clone.tokenColors.forEach((token) => stripItalic(token.settings));
    }

    if (clone.semanticTokenColors && typeof clone.semanticTokenColors === 'object') {
        Object.values(clone.semanticTokenColors).forEach((setting) => {
            if (setting && typeof setting === 'object') stripItalic(setting);
        });
    }

    return clone;
};

module.exports = async () => {
    const { base } = await generate();
    const noItalics = removeItalics(base);

    return Promise.all([
        fs.promises.writeFile(
            path.join(THEME_DIR, 'omni.json'),
            JSON.stringify(base, null, 4)
        ),
        fs.promises.writeFile(
            path.join(THEME_DIR, 'omni-no-italics.json'),
            JSON.stringify(noItalics, null, 4)
        ),
    ]);
};

if (require.main === module) {
    module.exports();
}
