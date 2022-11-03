import jwt from 'jsonwebtoken';

import Models from '../graphql/models/index.js';

export default (user = Models.Usuario) => {
    const autorizacion_token = jwt.sign({ "/graphql": { id: user._id } },
        "envPassSecret", { expiresIn: '3m' },
    );

    const actualizacion_token = jwt.sign({ "/graphql": { conteo_sesion: user.conteo_sesion } },
        "envPassSecret2", { expiresIn: '5m' },
    );

    return { autorizacion_token, actualizacion_token }
}