// src/services/userService.js
import prisma from '../config/database.js';

/**
 * User Service
 * Responsável pela lógica de negócio relacionada aos usuários
 * Contém as regras de validação, transformação de dados e acesso ao banco
 */

/**
 * Busca todos os usuários do sistema
 * @returns {Promise<Array>} Lista de usuários
 */
export const getAllUsers = async () => {
  const usuarios = await prisma.user.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
      // NÃO retorna a senha por segurança
    },
    orderBy: {
      createdAt: 'desc', // Mais recentes primeiro
    },
  });

  return usuarios;
};

/**
 * Busca um usuário por ID
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object|null>} Usuário encontrado ou null
 */
export const getUserById = async (userId) => {

  // Validação: ID deve ser um número positivo
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  const usuario = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
    },
  });

  return usuario;
};

/**
 * Verifica se um email já está cadastrado
 * @param {string} email - Email a ser verificado
 * @returns {Promise<boolean>} True se email existe, false caso contrário
 */
const emailExists = async (email) => {
  const usuario = await prisma.user.findUnique({
    where: { email },
  });

  return !!usuario; // Converte para boolean
};

/**
 * Valida os dados de um usuário
 * @param {Object} userData - Dados do usuário
 * @throws {Error} Se validação falhar
 */
const validateUserData = (userData) => {
  const { nome, email, senha } = userData;
  
  if (!nome || !email || !senha) {
    throw new Error('Nome, email e senha são obrigatórios');
  }

};

/**
 * Cria um novo usuário
 * @param {Object} userData - Dados do novo usuário
 * @returns {Promise<Object>} Usuário criado
 * @throws {Error} Se validação falhar ou email já existir
 */
export const createUser = async (userData) => {
  // 1. Validar dados de entrada
  validateUserData(userData);

  // 2. Verificar se email já existe
  const emailJaExiste = await emailExists(userData.email);
  if (emailJaExiste) {
    throw new Error('Email já cadastrado no sistema');
  }

  // 3. Criar usuário no banco
  const novoUsuario = await prisma.user.create({
   data: {
      nome: userData.nome,
      email: userData.email,
      senha: userData.senha,
      papel:  userData.papel || 'PROFESSOR', // Default: PROFESSOR
      foto:  userData.foto || null,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
    },
  });

  return novoUsuario;
};



//src/services/userService.js
/**
 * Atualiza um usuário existente
 * @param {number} userId - ID do usuário
 * @param {Object} userData - Dados para atualizar
 * @returns {Promise<Object>} Usuário atualizado
 * @throws {Error} Se validação falhar ou usuário não existir
 */
export const updateUser = async (userId, userData) => {
  // 1. Validar ID
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  // 2. Verificar se usuário existe
  const usuarioExistente = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });

  if (!usuarioExistente) {
    throw new Error(`Usuário com ID ${userId} não encontrado`);
  }

  // 3. Se email está sendo alterado, verificar unicidade
  if (userData.email && (userData.email !== usuarioExistente.email)) {
    const emailJaExiste = await emailExists(userData.email);
    if (emailJaExiste) {
      throw new Error('Email já está em uso por outro usuário');
    }
  }

  // 4. Preparar dados para atualização (apenas campos fornecidos)
  const dadosAtualizacao = {};

  if (userData.nome) dadosAtualizacao.nome = userData.nome;
  if (userData.email) dadosAtualizacao.email = userData.email;
  if (userData.senha) dadosAtualizacao.senha = userData.senha;
  if (userData.papel) dadosAtualizacao.papel = userData.papel;
  if (userData.foto !== undefined) dadosAtualizacao.foto = userData.foto;

  // 5. Atualizar no banco
  const usuarioAtualizado = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: dadosAtualizacao,
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      foto: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return usuarioAtualizado;
};

/**
 * Remove um usuário do sistema
 * @param {number} userId - ID do usuário
 * @returns {Promise<Object>} Dados do usuário removido
 * @throws {Error} Se usuário não existir
 */
export const deleteUser = async userId => {
  // 1. Validar ID
  if (!userId || isNaN(userId) || userId <= 0) {
    throw new Error('ID inválido. Deve ser um número positivo');
  }

  // 2. Verificar se usuário existe
  const usuarioExistente = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      nome: true,
      email: true,
    },
  });

  if (!usuarioExistente) {
    throw new Error(`Usuário com ID ${userId} não encontrado`);
  }

  // 3. Remover do banco
  await prisma.user.delete({
    where: { id: parseInt(userId) },
  });

  // 4. Retornar dados do usuário removido (para confirmação)
  return usuarioExistente;
  
};
// Exportações nomeadas para facilitar testes e imports
export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
