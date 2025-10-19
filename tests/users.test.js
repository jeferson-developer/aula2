// tests/users.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/server.js';

/**
 * Testes de Integração - User API
 * Testa os endpoints de usuários com banco de dados real
 */

describe('User API - Endpoints', () => {
  describe('GET /users', () => {
    it('deve retornar lista de usuários com status 200', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('deve retornar usuários sem campo senha', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);

      // Se houver usuários, verifica que não tem senha
      if (response.body.data.length > 0) {
        const primeiroUsuario = response.body.data[0];
        expect(primeiroUsuario).not.toHaveProperty('senha');
        expect(primeiroUsuario).toHaveProperty('id');
        expect(primeiroUsuario).toHaveProperty('nome');
        expect(primeiroUsuario).toHaveProperty('email');
      }
    });
  });

  describe('GET /users/:id', () => {
    it('deve retornar usuário específico com status 200', async () => {
      // Primeiro, busca todos para pegar um ID válido
      const todosUsuarios = await request(app).get('/users');

      // Se não houver usuários, cria um
      let userId;
      if (todosUsuarios.body.data.length === 0) {
        const novoUsuario = await request(app).post('/users').send({
          nome: 'Usuário Teste',
          email: `teste${Date.now()}@escola.com`,
          senha: 'senha123',
        });
        userId = novoUsuario.body.data.id;
      } else {
        userId = todosUsuarios.body.data[0].id;
      }

      // Agora busca por ID
      const response = await request(app).get(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id', userId);
      expect(response.body.data).not.toHaveProperty('senha');
    });

    it('deve retornar 404 para usuário inexistente', async () => {
      const response = await request(app).get('/users/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrado');
    });

    it('deve retornar 400 para ID inválido', async () => {
      const response = await request(app).get('/users/abc');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('inválido');
    });
  });

  describe('POST /users', () => {
    it('deve criar novo usuário com dados válidos', async () => {
      const novoUsuario = {
        nome: 'Prof. Teste',
        email: `teste${Date.now()}@escola.com`, // Email único
        senha: 'senha123',
        papel: 'PROFESSOR',
      };

      const response = await request(app).post('/users').send(novoUsuario);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.nome).toBe(novoUsuario.nome);
      expect(response.body.data.email).toBe(novoUsuario.email.toLowerCase());
      expect(response.body.data).not.toHaveProperty('senha');
    });

    it('deve retornar 400 ao criar usuário sem nome', async () => {
      const usuarioInvalido = {
        email: `teste${Date.now()}@escola.com`,
        senha: 'senha123',
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('obrigatório');
    });

    it('deve retornar 400 ao criar usuário com email inválido', async () => {
      const usuarioInvalido = {
        nome: 'Teste',
        email: 'emailinvalido', // Sem @
        senha: 'senha123',
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Email');
    });

    it('deve retornar 400 ao criar usuário com senha curta', async () => {
      const usuarioInvalido = {
        nome: 'Teste',
        email: `teste${Date.now()}@escola.com`,
        senha: '123', // Menos de 6 caracteres
      };

      const response = await request(app).post('/users').send(usuarioInvalido);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Senha');
    });

    it('deve retornar 400 ao criar usuário com email duplicado', async () => {
      const email = `duplicado${Date.now()}@escola.com`;

      // Cria primeiro usuário
      await request(app).post('/users').send({
        nome: 'Primeiro',
        email: email,
        senha: 'senha123',
      });

      // Tenta criar segundo com mesmo email
      const response = await request(app).post('/users').send({
        nome: 'Segundo',
        email: email,
        senha: 'senha123',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('já cadastrado');
    });
  });

  describe('PUT /users/:id', () => {
    it('deve atualizar usuário existente', async () => {
      // Cria usuário para testar
      const novoUsuario = await request(app).post('/users').send({
        nome: 'Usuario Original',
        email: `original${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const userId = novoUsuario.body.data.id;

      // Atualiza o usuário
      const response = await request(app)
        .put(`/users/${userId}`)
        .send({
          nome: 'Usuario Atualizado',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.nome).toBe('Usuario Atualizado');
      expect(response.body.data.id).toBe(userId);
    });

    it('deve retornar 404 ao atualizar usuário inexistente', async () => {
      const response = await request(app).put('/users/99999').send({
        nome: 'Teste',
      });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrado');
    });

    it('deve retornar 400 ao tentar usar email já existente', async () => {
      // Cria dois usuários
      const usuario1 = await request(app).post('/users').send({
        nome: 'Usuario 1',
        email: `user1${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const usuario2 = await request(app).post('/users').send({
        nome: 'Usuario 2',
        email: `user2${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      // Tenta atualizar usuario2 com email do usuario1
      const response = await request(app)
        .put(`/users/${usuario2.body.data.id}`)
        .send({
          email: usuario1.body.data.email,
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('já está em uso');
    });
  });

  describe('DELETE /users/:id', () => {
    it('deve deletar usuário existente', async () => {
      // Cria usuário para deletar
      const novoUsuario = await request(app).post('/users').send({
        nome: 'Usuario Para Deletar',
        email: `deletar${Date.now()}@escola.com`,
        senha: 'senha123',
      });

      const userId = novoUsuario.body.data.id;

      // Deleta o usuário
      const response = await request(app).delete(`/users/${userId}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.message).toContain('removido com sucesso');

      // Verifica que não existe mais
      const busca = await request(app).get(`/users/${userId}`);
      expect(busca.status).toBe(404);
    });

    it('deve retornar 404 ao deletar usuário inexistente', async () => {
      const response = await request(app).delete('/users/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('não encontrado');
    });
  });

  describe('GET /health', () => {
    it('deve retornar status da API', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('services');
      expect(response.body.services).toHaveProperty('api', 'OK');
      expect(response.body.services).toHaveProperty('database');
    });
  });
});