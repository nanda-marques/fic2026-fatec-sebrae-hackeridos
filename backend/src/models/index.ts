import Cargo from "./Cargo.js";
import Administrador from "./Administrador.js";
import TokenRecuperacao from "./TokenRecuperacao.js";
import ImagemPerfil from "./ImagemPerfil.js"; 
import HistoricoSolicitacaoAdmin from "./HistoricoSolicitacaoAdmin.js";
import Publicacao from "./Publicacao.js";
import Animal from "./Animal.js";

// Associações
Cargo.hasMany(Administrador, {
  foreignKey: "cargo",
  as: "administradores",
});

Administrador.belongsTo(Cargo, {
  foreignKey: "cargo",
  as: "cargoRef",
});

export {
  Cargo,
  Administrador,
  TokenRecuperacao,
  ImagemPerfil,
  HistoricoSolicitacaoAdmin,
  Publicacao,
  Animal,
};