export default async function handler(req: any, res: any) {
  // 1. CABEÇALHOS ANTI-CORS (A Mágica para não dar erro no localhost)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 2. RESPOSTA RÁPIDA PARA O NAVEGADOR (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. SEGURANÇA: Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { titulo, preco, email, tenantId } = req.body;

  try {
    // 4. COMUNICAÇÃO COM O MERCADO PAGO
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`,
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
          success: 'https://www.zunox.com.br/painel',
          failure: 'https://www.zunox.com.br/assinatura',
          pending: 'https://www.zunox.com.br/assinatura'
        },
        auto_return: 'approved'
      })
    });

    const data = await response.json();

    // 5. DEVOLVE O LINK DE PAGAMENTO
    return res.status(200).json({ link_pagamento: data.init_point });

  } catch (error) {
    console.error('Erro no Mercado Pago:', error);
    return res.status(500).json({ error: 'Falha ao gerar o link de pagamento' });
  }
}