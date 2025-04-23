// Integração ContentKit para Simulador de Staking Fluffy Bears
// Este código deve ser usado para criar uma integração personalizada no Gitbook

const { createComponent } = require('@gitbook/contentkit');

// Componente principal do simulador
const stakingSimulator = createComponent({
  componentId: 'fluffy-bears-staking-simulator',
  
  // Estado inicial do simulador
  initialState: {
    aprBeraPool: 317,
    aprBgtStake: 328,
    initialBera: 50000,
    totalNfts: 100,
    stakeDays: 45,
    yourStakeDays: 15,
    yourNftsCount: 1,
    showResults: false,
    totalBgt: 0,
    totalCommunityPoints: 0,
    valuePerPoint: 0,
    yourPoints: 0,
    yourReward: 0,
    dailyRewards: []
  },
  
  // Manipulador de ações
  async action(previous, action) {
    switch (action.action) {
      case 'calculate': {
        // Obter valores dos inputs
        const aprBeraPool = previous.state.aprBeraPool / 365; // APR diário
        const aprBgtStake = previous.state.aprBgtStake / 365; // APR diário
        const initialBera = previous.state.initialBera;
        const totalNfts = previous.state.totalNfts;
        const stakeDays = previous.state.stakeDays;
        const yourStakeDays = previous.state.yourStakeDays;
        const yourNftsCount = previous.state.yourNftsCount;
        
        // Calcular rendimentos diários
        let dailyRewards = [];
        let totalBgtAccumulated = 0;
        let bgtStaked = 0;
        
        for (let day = 1; day <= 45; day++) {
          // Recompensa da pool BERA/BGT
          const beraPoolReward = initialBera * (aprBeraPool / 100);
          
          // Recompensa do stake de BGT
          const bgtStakeReward = bgtStaked * (aprBgtStake / 100);
          
          // Total de recompensa do dia
          const dailyReward = beraPoolReward + bgtStakeReward;
          
          // Acumular BGT para stake
          bgtStaked += beraPoolReward;
          
          // Acumular total de BGT
          totalBgtAccumulated += dailyReward;
          
          // Armazenar dados do dia
          dailyRewards.push({
            day,
            dailyReward,
            beraPoolReward,
            bgtStakeReward,
            totalAccumulated: totalBgtAccumulated
          });
        }
        
        // Calcular pontos e recompensas
        const pointsPerDay = 86400; // 1 ponto por segundo
        const totalPoints = totalNfts * stakeDays * pointsPerDay;
        const valuePerPoint = totalBgtAccumulated / totalPoints;
        const yourPoints = yourNftsCount * yourStakeDays * pointsPerDay;
        const yourReward = yourPoints * valuePerPoint;
        
        // Retornar novo estado
        return {
          state: {
            ...previous.state,
            showResults: true,
            totalBgt: totalBgtAccumulated,
            totalCommunityPoints: totalPoints,
            valuePerPoint: valuePerPoint,
            yourPoints: yourPoints,
            yourReward: yourReward,
            dailyRewards: dailyRewards
          }
        };
      }
      
      // Atualizar valores dos inputs
      case 'update-apr-bera-pool':
        return { state: { ...previous.state, aprBeraPool: parseFloat(action.value) } };
      case 'update-apr-bgt-stake':
        return { state: { ...previous.state, aprBgtStake: parseFloat(action.value) } };
      case 'update-initial-bera':
        return { state: { ...previous.state, initialBera: parseFloat(action.value) } };
      case 'update-total-nfts':
        return { state: { ...previous.state, totalNfts: parseInt(action.value) } };
      case 'update-stake-days':
        return { state: { ...previous.state, stakeDays: parseInt(action.value) } };
      case 'update-your-stake-days':
        return { state: { ...previous.state, yourStakeDays: parseInt(action.value) } };
      case 'update-your-nfts-count':
        return { state: { ...previous.state, yourNftsCount: parseInt(action.value) } };
      
      default:
        return { state: previous.state };
    }
  },
  
  // Renderização do componente
  async render(element) {
    // Função para formatar números
    const formatNumber = (number) => {
      return number.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 6 
      });
    };
    
    // Renderizar tabela de resultados
    const renderResultsTable = () => {
      if (!element.state.showResults) return null;
      
      return (
        <table>
          <thead>
            <tr>
              <th>Dia</th>
              <th>Recompensa Diária (BGT)</th>
              <th>Recompensa da Pool BERA/BGT</th>
              <th>Recompensa do Stake BGT</th>
              <th>Total Acumulado (BGT)</th>
            </tr>
          </thead>
          <tbody>
            {element.state.dailyRewards.map(reward => (
              <tr key={reward.day}>
                <td>{reward.day}</td>
                <td>{formatNumber(reward.dailyReward)}</td>
                <td>{formatNumber(reward.beraPoolReward)}</td>
                <td>{formatNumber(reward.bgtStakeReward)}</td>
                <td>{formatNumber(reward.totalAccumulated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    };
    
    // Renderizar gráfico de resultados
    const renderChart = () => {
      if (!element.state.showResults) return null;
      
      // Preparar dados para o gráfico
      const chartData = {
        labels: element.state.dailyRewards.map(reward => `Dia ${reward.day}`),
        datasets: [{
          label: 'BGT Acumulado',
          data: element.state.dailyRewards.map(reward => reward.totalAccumulated),
          backgroundColor: 'rgba(56, 132, 255, 0.2)',
          borderColor: 'rgba(56, 132, 255, 1)',
          borderWidth: 2
        }]
      };
      
      return (
        <webframe
          source={{ uri: 'https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.min.js' }}
          data={{ chartData }}
          height={350}
        />
      );
    };
    
    // Renderizar resultados
    const renderResults = () => {
      if (!element.state.showResults) return null;
      
      return (
        <block>
          <heading level={3}>Resultados da Simulação</heading>
          
          <card>
            <text>Total de BGT Acumulado após 45 dias:</text>
            <heading level={4}>{formatNumber(element.state.totalBgt)} BGT</heading>
          </card>
          
          <card>
            <text>Total de Pontos Acumulados pela Comunidade:</text>
            <heading level={4}>{formatNumber(element.state.totalCommunityPoints)} pontos</heading>
          </card>
          
          <card>
            <text>Valor por Ponto:</text>
            <heading level={4}>{element.state.valuePerPoint.toFixed(10)} BGT</heading>
          </card>
          
          <card>
            <text>Seus Pontos Acumulados:</text>
            <heading level={4}>{formatNumber(element.state.yourPoints)} pontos</heading>
          </card>
          
          <card>
            <text>Sua Recompensa Estimada:</text>
            <heading level={4}>{formatNumber(element.state.yourReward)} BGT</heading>
          </card>
          
          {renderChart()}
          {renderResultsTable()}
        </block>
      );
    };
    
    // Renderização principal
    return (
      <block>
        <heading level={2}>Simulador de Staking Fluffy Bears</heading>
        
        <hstack>
          <vstack>
            <text>APR da Pool BERA/BGT (%)</text>
            <textinput
              value={element.state.aprBeraPool.toString()}
              onTextChange={{
                action: 'update-apr-bera-pool',
                value: element.dynamicState('aprBeraPool')
              }}
            />
          </vstack>
          
          <vstack>
            <text>APR do Stake de BGT (%)</text>
            <textinput
              value={element.state.aprBgtStake.toString()}
              onTextChange={{
                action: 'update-apr-bgt-stake',
                value: element.dynamicState('aprBgtStake')
              }}
            />
          </vstack>
        </hstack>
        
        <hstack>
          <vstack>
            <text>Valor Inicial em BERA</text>
            <textinput
              value={element.state.initialBera.toString()}
              onTextChange={{
                action: 'update-initial-bera',
                value: element.dynamicState('initialBera')
              }}
            />
          </vstack>
          
          <vstack>
            <text>Número de NFTs Participantes</text>
            <textinput
              value={element.state.totalNfts.toString()}
              onTextChange={{
                action: 'update-total-nfts',
                value: element.dynamicState('totalNfts')
              }}
            />
          </vstack>
        </hstack>
        
        <hstack>
          <vstack>
            <text>Dias em Stake (Média dos Participantes)</text>
            <textinput
              value={element.state.stakeDays.toString()}
              onTextChange={{
                action: 'update-stake-days',
                value: element.dynamicState('stakeDays')
              }}
            />
          </vstack>
          
          <vstack>
            <text>Seus Dias em Stake</text>
            <textinput
              value={element.state.yourStakeDays.toString()}
              onTextChange={{
                action: 'update-your-stake-days',
                value: element.dynamicState('yourStakeDays')
              }}
            />
          </vstack>
        </hstack>
        
        <vstack>
          <text>Quantidade de NFTs em Stake</text>
          <textinput
            value={element.state.yourNftsCount.toString()}
            onTextChange={{
              action: 'update-your-nfts-count',
              value: element.dynamicState('yourNftsCount')
            }}
          />
        </vstack>
        
        <button
          label="Calcular Rendimentos"
          onPress={{
            action: 'calculate'
          }}
        />
        
        {renderResults()}
      </block>
    );
  }
});

// Exportar o componente
module.exports = {
  stakingSimulator
};
