

maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: [bibliotecaData.coords.lon, bibliotecaData.coords.lat],
    //biblioteca.geometry.coordinates, // starting position [lng, lat]
    zoom: 8 // starting zoom
});

new maptilersdk.Marker()
    .setLngLat([bibliotecaData.coords.lon, bibliotecaData.coords.lat]) //biblioteca.geometry.coordinates
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(`<h3>${bibliotecaData.nombre}</h3> <p>${bibliotecaData.localidad}</p>`)
    )
    .addTo(map)