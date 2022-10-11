const mongoose = require('mongoose');

const CreacionSchema = new mongoose.Schema({
    id_usuario: { type: String, required: true },
    estado: { type: String, required: true },
    ciudad: { type: String, required: true },
    categorias: { type: [String], required: true },
    tipo: { type: String, required: true },
    fecha_creacion: { type: Date, default: Date.now() }
});

const bitacoraCreacionesSchema = new mongoose.Schema({
    fecha_bitacora: { type: Date, default: Date.now() },
    count_creacion: { type: Number, default: 0 },
    count_anuncio: { type: Number, default: 0 },
    count_registro: { type: Number, default: 0 },
    count_inicio_sesion: { type: Number, default: 0 },
    Creacion: { type: [CreacionSchema], required: true, default: undefined }
});

const bitacoraCreaciones = mongoose.model('bitacoraCreaciones', bitacoraCreacionesSchema);
export default bitacoraCreaciones;