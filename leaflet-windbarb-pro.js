/**
 * Leaflet.WindBarbPro
 * A modernized, high-visibility wind barb plugin for Leaflet.
 * Supports dynamic Saffir-Simpson color injection, native SVG rotation, and CSS drop shadows.
 */

(function (L) {
    if (!L) throw new Error("Leaflet must be loaded first!");

    L.WindBarbPro = L.WindBarbPro || {};

    L.WindBarbPro.Icon = L.DivIcon.extend({
        options: {
            className: 'leaflet-windbarb-pro',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            speed: 0,
            deg: 0,
            color: '#000000',
            strokeWidth: 4,
            showShadow: true,
            centerDotRadius: 5
        },

        createIcon: function (oldIcon) {
            const div = L.DivIcon.prototype.createIcon.call(this, oldIcon);
            const opt = this.options;

            // If speed is extremely low, return a calm circle
            if (opt.speed < 5) {
                // MATCH the width/height to opt.iconSize so the anchor works correctly
                div.innerHTML = `<svg width="${opt.iconSize[0]}" height="${opt.iconSize[1]}" viewBox="0 0 100 100" style="${shadowStr}">
                    <circle cx="50" cy="50" r="10" fill="none" stroke="${opt.color}" stroke-width="6"/>
                </svg>`;
                return div;
            }

            const safeDir = (isNaN(opt.deg) || opt.deg === 'N/A') ? 0 : opt.deg;
            const shadowStr = opt.showShadow ? 'filter: drop-shadow(0px 0px 2px rgba(0,0,0,0.9));' : '';

            let svg = `<svg width="${opt.iconSize[0]}" height="${opt.iconSize[1]}" viewBox="0 0 100 100" style="transform: rotate(${safeDir}deg); overflow: visible; ${shadowStr}">`;
            
            // Main staff
            svg += `<line x1="50" y1="50" x2="50" y2="5" stroke="${opt.color}" stroke-width="${opt.strokeWidth}" stroke-linecap="round"/>`;

            let y = 5; 
            let remainingSpeed = opt.speed;

            // 50-knot flags
            while (remainingSpeed >= 48) { 
                svg += `<polygon points="50,${y} 75,${y+5} 50,${y+10}" fill="${opt.color}" stroke="${opt.color}" stroke-width="1"/>`;
                y += 12;
                remainingSpeed -= 50;
            }

            // 10-knot barbs
            while (remainingSpeed >= 8) { 
                svg += `<line x1="50" y1="${y}" x2="75" y2="${y-8}" stroke="${opt.color}" stroke-width="${opt.strokeWidth}" stroke-linecap="round"/>`;
                y += 8;
                remainingSpeed -= 10;
            }

            // 5-knot half barbs
            if (remainingSpeed >= 3) { 
                svg += `<line x1="50" y1="${y}" x2="65" y2="${y-5}" stroke="${opt.color}" stroke-width="${opt.strokeWidth}" stroke-linecap="round"/>`;
            }

            // Center anchor dot
            svg += `<circle cx="50" cy="50" r="${opt.centerDotRadius}" fill="${opt.color}" stroke="#000" stroke-width="2"/></svg>`;
            
            div.innerHTML = svg;
            return div;
        }
    });

    L.WindBarbPro.icon = function (options) {
        return new L.WindBarbPro.Icon(options);
    };

})(L);
