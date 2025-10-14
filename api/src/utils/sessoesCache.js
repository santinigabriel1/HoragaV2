// Inicializa um array vazio para armazenar sessões
let sessoes = [];

/**
 * Adicionar um sessão em uso ao cache de sessoes
 *
 * @param {number} usuario - Id do usuário
 * @param {string} token - Token de 128 bit gerado
 * @returns {void} Sem retorno
 */
export function addSessao(usuario, token) {
  sessoes.push({
    usuario,
    token,
    criadoEm: Date.now()
  });
}


/**
 * Busca sessão por usuario_id
 *
 * @param {number} usuario - Id do usuário * 
 * @param {string} token - Token a ser validado.
 * @returns {Object||null} - Se existente retorna a sessão do usuario, caso contrário null
 */
export function buscarSessao(usuario, token) {
  return sessoes.find(s => (s.usuario === usuario && s.token === token));
}

// Função para limpar sessões expiradas
function limparSessoes() {
  const agora = Date.now();
  const umaHora = 360 * 1000; // 1 hora em milissegundos

  sessoes = sessoes.filter(session => (agora - session.criadoEm) < umaHora);

  console.log(`[CLEANUP] Sessões ativas: ${sessoes.length}`);
}

// Configura o intervalo para limpar sessões a cada 1 hora
setInterval(limparSessoes, 360 * 1000); 

