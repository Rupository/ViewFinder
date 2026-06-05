const params = new URLSearchParams(window.location.search);
const outlet = params.get('outlet');
    if (outlet) {
        document.getElementById('nicegui-frame').src = 
        `https://viewfinder.medialens.dpdns.org/ui/historical/visualization/${encodeURIComponent(outlet)}`;
    }