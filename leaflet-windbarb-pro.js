/**
 * Leaflet.WindBarbPro
 * A modernized, high-visibility wind barb plugin for Leaflet.
 * Fully unified: Handles both SVG generation and tooltip binding in one marker.
 */

(function (L) {
    if (!L) throw new Error("Leaflet must be loaded first!");

    // Extend the native Leaflet Marker
    L.WindBarbPro = L.Marker.extend({
        
        // ALL options live here now (visuals + tooltips)
        options: {
            // Visual Options
            className: 'leaflet-windbarb-pro',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
            speed: 0,
            deg: 0,
            color: '#000000',
            strokeWidth: 4,
            showShadow: true,
            centerDotRadius: 5,
            
            // Tooltip Options
            showTooltip: true,
            units: 'kts',
            time: '',
            stationName: 'Wind Station'
        },

        initialize: function (latlng, options) {
            // Merge user options with defaults
            L.setOptions(this, options);
            const opt = this.options;

            // 1. Generate the SVG using our helper function below
            const svgHtml = this._buildSVG(opt);

            // 2. Dynamically create a standard Leaflet DivIcon
            opt.icon = L.divIcon({
                className: opt.className,
                html: svgHtml,
                iconSize: opt.iconSize,
                iconAnchor: opt.iconAnchor
            });

            // 3. Initialize the standard Leaflet Marker with our generated icon
            L.Marker.prototype.initialize.call(this, latlng, opt);

            // 4. Bind the tooltip ONLY if enabled
            if (opt.showTooltip) {
                const timeStr = opt.time ? `<br><span style="font-size: 0.9em; color: #666;">Valid: ${opt.time}</span>` : '';
                
                const tooltipHtml = `
                    <div style="text-align: center;">
                        Wind: <strong>${opt.speed} ${opt.units}</strong><br>
                        Direction: <strong>${opt.deg}°</strong>
                        ${timeStr}
                    </div>
                `;
                
                this.bindTooltip(tooltipHtml, {
                    direction: 'top',
                    offset: [0, -20]
                });
            }
        },

        // Helper function strictly for drawing the SVG graphic
        _buildSVG: function(opt) {
            // If speed is extremely low, return a calm circle
            if (opt.speed < 5) {
                return `<svg width="${opt.iconSize[0]}" height="${opt.iconSize[1]}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${opt.centerDotRadius}" fill="none" stroke="${opt.color}" stroke-width="6"/></svg>`;
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
            
            return svg;
        }
    });

    // The single, clean factory function
    L.windBarbPro = function (latlng, options) {
        return new L.WindBarbPro(latlng, options);
    };

})(L);
