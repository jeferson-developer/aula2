// src/server.js
import express from 'express';
import prisma from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsing JSON
app.use(express.json());

// Rota de health check
app.get('/health', async (req, res) => {
  let databaseStatus = 'OK';
  let databaseMessage = 'Conexão com banco de dados funcionando';

  try {
    // Tenta fazer uma query simples no banco
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    databaseStatus = 'ERROR';
    databaseMessage = 'Falha na conexão com banco de dados';
    console.error('Erro na verificação do banco:', error);
  }

  // Define o status HTTP baseado na saúde do banco
  const httpStatus = databaseStatus === 'OK' ? 200 : 503;

  res.status(httpStatus).json({
    status: databaseStatus === 'OK' ? 'OK' : 'DEGRADED',
    message: 'API do Gerador de Provas',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: {
      api: 'OK',
      database: {
        status: databaseStatus,
        message: databaseMessage,
      },
    },
  });
});

// Rota básica para usuários (professores)
app.get('/users', async (req, res) => {

  try {
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        papel: true,
        foto: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários',
      error: error.message,
    });
  }

});

// Middleware de tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`,
  });
});

// Inicializar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Usuários: http://localhost:${PORT}/users`);
});

// Export default para ES Modules
export default app;