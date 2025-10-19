// src/server.js
import express from 'express';
import prisma from './config/database.js'; 
import userRoutes from './routes/userRoutes.js';

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

// Rotas da API
app.use('/users', userRoutes); // <--

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