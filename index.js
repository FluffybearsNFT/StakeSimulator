// Arquivo principal da integração ContentKit
// Este arquivo exporta os componentes para o Gitbook

const { stakingSimulator } = require('./fluffy-bears-staking-simulator-contentkit');

// Exportar componentes
module.exports = {
  components: {
    blocks: {
      'staking-simulator': stakingSimulator
    }
  }
};
