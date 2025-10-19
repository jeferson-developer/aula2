// src/routes/userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';

const router = express.Router();

/**
 * Rotas de Usuários
 * Base URL: /users
 */

// CREATE - Criar novo usuário
router.post('/', userController.create);

// READ - Listar todos os usuários
router.get('/', userController.getAll);

// READ - Buscar usuário por ID
router.get('/:id', userController.getById);

export default router;