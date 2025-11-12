const mongoose = require('mongoose');

// MongoDB 연결 상태 확인
exports.checkHealth = async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const isConnected = dbState === 1;
    const connectionInfo = {
      status: isConnected ? 'connected' : dbStates[dbState],
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
    };

    res.status(isConnected ? 200 : 503).json({
      success: isConnected,
      server: 'running',
      database: connectionInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      server: 'running',
      database: {
        status: 'error',
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
};










