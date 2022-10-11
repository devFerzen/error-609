import * as mongoose from 'mongoose'

const ddlsGeneralSchema = new mongoose.Schema({
    no_id: { type: String, required: true },
    descripcion: { type: String, required: true },
    icono_icono: { type: String },
    icono_categoria: { type: String },
    estado: { type: Boolean, default: true },
    categoria: { type: String, required: true },
    no_estado: { type: String }
});
const ddlGeneral = new mongoose.model('ddlGeneral', ddlsGeneralSchema)
export default ddlGeneral;