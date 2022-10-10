import { makeExecutableSchema } from'apollo-server-express';
const { merge } = require('lodash');

const {
  TiposGlobalesBase
} = require('./queries/tipos-globales-base.js');

const {
  TiposGlobalesSubbase
} = require('./queries/tipos-globales-subBase.js');

const {
  AnuncioQueries,
  AnuncioResolvers
} = require('./queries/anuncio-queries.js');

const {
  GeneralQueries,
  GeneralResolvers
} = require('./queries/general-queries.js');

const {
  PaqueteQueries,
  PaqueteResolvers
} = require('./queries/paquetes-queries.js');

const {
  UsuarioQueries,
  UsuarioResolvers
} = require('./queries/usuario-queries.js');

const Query = `
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }
`;

export const graphqlSchema =  makeExecutableSchema({
    typeDefs: [Query, AnuncioQueries, GeneralQueries, PaqueteQueries, UsuarioQueries, TiposGlobalesBase, TiposGlobalesSubbase],
    resolvers: merge(AnuncioResolvers, GeneralResolvers, PaqueteResolvers, UsuarioResolvers)
});