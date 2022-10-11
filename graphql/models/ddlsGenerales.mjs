import mongoose from 'mongoose'
const Schema = mongoose.Schema;

const ddlsGeneralSchema = new Schema({
    no_id: { type: String, required: true },
    descripcion: { type: String, required: true },
    icono_icono: { type: String },
    icono_categoria: { type: String },
    estado: { type: Boolean, default: true },
    categoria: { type: String, required: true },
    no_estado: { type: String }
});
const ddlGeneral = mongoose.model('ddlGeneral', ddlsGeneralSchema)
export default ddlGeneral;