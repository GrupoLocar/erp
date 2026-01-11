const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const schema = new mongoose.Schema({
    nome: String,
    matricula: String,
    email: String,
    senha_hash: String,
    ativo: Boolean,
    nome_completo: String,
    permissoes: [String],
});

schema.methods.validarSenha = function (senha) {
    return bcrypt.compareSync(senha, this.senha_hash);
};

module.exports = mongoose.model('Funcionario', schema);
