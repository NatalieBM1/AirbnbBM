const fetch = require('node-fetch');
const csv = require('csv-parser');
const { Readable } = require('stream');

// URLs de los CSV
const urls = {
  asheville: 'https://data.insideairbnb.com/united-states/nc/asheville/2025-06-17/visualisations/listings.csv.gz',
  austin: 'https://data.insideairbnb.com/united-states/tx/austin/2025-06-13/visualisations/listings.csv.gz',
  boston: 'https://data.insideairbnb.com/united-states/ma/boston/2025-06-19/visualisations/listings.csv.gz',
  chicago: 'https://data.insideairbnb.com/united-states/il/chicago/2025-06-17/visualisations/listings.csv.gz',
  dallas: 'https://data.insideairbnb.com/united-states/tx/dallas/2025-08-19/visualisations/listings.csv.gz',
};

// Helper para leer CSV desde URL
async function fetchCSV(url) {
  const response = await fetch(url);
  const buffer = await response.buffer();
  // Descomprimir si es .gz
  const zlib = require('zlib');
  const csvData = zlib.gunzipSync(buffer);
  return new Promise((resolve, reject) => {
    const results = [];
    Readable.from(csvData)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Obtener todas las propiedades de una ciudad (ejemplo: asheville)
exports.getProperties = async (req, res) => {
  try {
    const city = req.query.city || 'asheville'; // Puedes pasar ?city=austin
    if (!urls[city]) return res.status(400).json({ message: 'Ciudad no soportada' });
    const properties = await fetchCSV(urls[city]);
    res.json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener propiedades', error });
  }
};

// Obtener detalle de propiedad por id (listing_id)
exports.getPropertyDetail = async (req, res) => {
  try {
    const city = req.query.city || 'asheville';
    if (!urls[city]) return res.status(400).json({ message: 'Ciudad no soportada' });
    const properties = await fetchCSV(urls[city]);
    const property = properties.find(p => p.id === req.params.id);
    if (!property) return res.status(404).json({ message: 'Propiedad no encontrada' });
    res.json(property);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener detalle de propiedad', error });
  }
};
