const express = require('express');
const Funcionario = require('../models/funcionario');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { matricula, senha } = req.body;

    const func = await Funcionario.findOne({ matricula, situacao: 'ativo' });
    if (!func || !func.validarSenha(senha)) {
        return res.status(401).json({ error: 'Login Incorreto ou não válido' });
    }

    res.json(func);
});

module.exports = router;
