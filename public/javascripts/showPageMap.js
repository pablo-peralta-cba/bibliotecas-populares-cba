maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.BRIGHT,
  center: [bibliotecaData.coords.lon, bibliotecaData.coords.lat],
  zoom: 8,
});

new maptilersdk.Marker()
  .setLngLat([bibliotecaData.coords.lon, bibliotecaData.coords.lat])
  .setPopup(
    new maptilersdk.Popup({ offset: 25 }).setHTML(
      `<h3>${bibliotecaData.nombre}</h3> <p>${bibliotecaData.localidad}</p>`
    )
  )
  .addTo(map);
