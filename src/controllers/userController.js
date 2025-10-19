// src/controllers/userController.js
import * as userService from '../services/userService.js';

/**
 * User Controller
 * Responsável por gerenciar requisições HTTP relacionadas aos usuários
 * Delega a lógica de negócio para o UserService
 */

/**
 * GET /users
 * Lista todos os usuários
 */
export const getAll = async (req, res) => {
  try {
    const usuarios = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message,
    });
  }
};

/**
 * GET /users/:id
 * Busca um usuário específico por ID
 */
export const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await userService.getUserById(id);

    // Usuário não encontrado
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: `Usuário com ID ${id} não encontrado`,
      });
    }

    res.status(200).json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    // Se erro é de validação, retorna 400
    if (error.message.includes('inválido')) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message,
    });
  }
};

/**
 * POST /users
 * Cria um novo usuário
 */
export const create = async (req, res) => {
  try {
    const novoUsuario = await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: novoUsuario,
    });
  } catch (error) {

    // Erros de validação retornam 400
    if (
      error.message.includes('obrigatórios') ||
      error.message.includes('já cadastrado')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário',
      error: error.message,
    });
  }
};

/**
 * PUT /users/:id
 * Atualiza um usuário existente
 */
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioAtualizado = await userService.updateUser(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado,
    });
  } catch (error) {
  
    // Erros de validação
    if (
      error.message.includes('já está em uso')
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message,
    });
  }
};

/**
 * DELETE /users/:id
 * Remove um usuário do sistema
 */
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioRemovido = await userService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: 'Usuário removido com sucesso',
      data: usuarioRemovido,
    });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    
    // Usuário não encontrado
    if (error.message.includes('não encontrado')) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro ao remover usuário',
      error: error.message,
    });
  }
};