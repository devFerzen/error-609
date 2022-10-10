import { makeExecutableSchema } from 'apollo-server-express';
import { merge } from 'lodash/index.js';

import {
  typeDef as TiposGlobalesBase
} from './queries/tipos-globales-base.js';

import {
  typeDef as TiposGlobalesSubbase
} from './queries/tipos-globales-subBase.js';

import {
  typeDef as AnuncioQueries,
  resolvers as AnuncioResolvers
} from './queries/anuncio-queries.js';

import {
  typeDef as GeneralQueries,
  resolvers as GeneralResolvers
} from './queries/general-queries.js';

import {
  typeDef as PaqueteQueries,
  resolvers as PaqueteResolvers
} from './queries/paquetes-queries.js';

import {
  typeDef as UsuarioQueries,
  resolvers as UsuarioResolvers
} from './queries/usuario-queries.js';

const Query = `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export default makeExecutableSchema({
    typeDefs: [Query, AnuncioQueries, GeneralQueries, PaqueteQueries, UsuarioQueries, TiposGlobalesBase, TiposGlobalesSubbase],
    resolvers: merge(AnuncioResolvers, GeneralResolvers, PaqueteResolvers, UsuarioResolvers)
});