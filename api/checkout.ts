export default async function handler(req: any, res: any) {
  // Libera o CORS para qualquer origem (permite chamadas do localhost e do app)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde imediatamente a requisições de teste do navegador (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Apenas aceita pedidos POST (envio de dados)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Recebe os dados enviados pela aplicação ZunoX
  const { titulo, preco, email, tenantId } = req.body;

  try {
    // Comunicação invisível e segura com o servidor do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`, // A chave guardada na Vercel
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            title: titulo,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: Number(preco)
          }
        ],
        payer: {
          email: email || 'cliente@zunox.com.br'
        },
        external_reference: tenantId,
        back_urls: {
          success: 'https://zunox.com.br/painel',
          failure: 'https://zunox.com.br/assinatura',
          pending: 'https://zunox.com.br/assinatura'
        },
        auto_return: 'approved'
      })
    });

    const data = await response.json();

    // Devolve para a aplicação o link seguro do ecrã de pagamento do Mercado Pago
    return res.status(200).json({ link_pagamento: data.init_point });

  } catch (error) {
    console.error('Erro no Mercado Pago:', error);
    return res.status(500).json({ error: 'Falha ao gerar o link de pagamento' });
  }
}