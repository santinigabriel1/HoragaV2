// Função base e padronizada para o envio de resposta

function enviarResposta(res, { success, statusCode, message, data = null, quant_rows = 0}) {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    quant_rows,
    data
  });
}

// Atalho para respostas de sucesso
export const success = (res, { statusCode = 200, message = "OK", data = null}) => {
  return enviarResposta(res, {
    success: true,
    statusCode,
    message,
    data,
    quant_rows: Array.isArray(data) ? data.length : (data ? 1 : 0)
  });
};

// Atalho para recurso não encontrado
export const notFound = (res, { message = "Recurso não encontrado"}={}) => {
  return enviarResposta(res, {
    success: false,
    statusCode: 404,
    message,
    data: null,
    quant_rows: 0
  });
};


// Atalho para erros genéricos
export const error = (res, {statusCode = 500, message = "Erro interno do servidor"}) => {
  return enviarResposta(res, {
    success: false,
    statusCode,
    message,
    data: null,
    quant_rows: 0
  });
};

