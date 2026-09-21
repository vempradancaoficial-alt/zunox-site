export default async function handler(req: any, res: any) {
  // Apenas aceita pedidos POST (envio de dados da aplicação)
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
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`, // A chave que trancámos na Vercel!
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
          email: email || 'cliente@zunox.com.br' // Email padrão caso não seja enviado
        },
        external_reference: tenantId, // A "etiqueta" para sabermos qual barbeiro pagou
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