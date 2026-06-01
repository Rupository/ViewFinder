const params = new URLSearchParams(window.location.search);
const outlet = params.get('outlet');
    if (outlet) {
        document.getElementById('nicegui-frame').src = 
        `http://127.0.0.1:5000/ui/historical/visualization/${encodeURIComponent(outlet)}`;
    }