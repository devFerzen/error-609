import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const anunciosEnVerificacionSchema = new Schema(
  {
    id_anuncio: { type: String, required: true },
    foto_anuncio: { type: String, required: true },
    respuesta: { type: Boolean, default: false },
    comentario: { type: String, default: undefined },
    fecha_respuesta: { type: Date, default: undefined }
  },
  {
    timestamps: {
      createdAt: 'fecha_creacion',
      updatedAt: false
    }
  }
);
const anunciosEnVerificacion = mongoose.model('anunciosEnVerificacion', anunciosEnVerificacionSchema);
export default anunciosEnVerificacion;
