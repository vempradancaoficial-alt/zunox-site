import * as admin from 'firebase-admin';

// 1. INICIALIZAR A CHAVE MESTRA DO FIREBASE
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req: any, res: any) {
  // Retorno rápido obrigatório para o Mercado Pago
  res.status(200).send('OK');

  if (req.method !== 'POST') return;

  try {
    const { action, data } = req.body;

    // 2. Só avança se for um pagamento novo ou atualizado
    if (action === 'payment.created' || action === 'payment.updated') {
      const idPagamento = data?.id;
      if (!idPagamento) return;

      // 3. Consulta o Mercado Pago para ter a certeza absoluta que o pagamento é real
      const respostaMp = await fetch(`https://api.mercadopago.com/v1/payments/${idPagamento}`, {
        headers: {
          'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      });

      const detalhesPagamento = await respostaMp.json();

      // 4. A MÁGICA: Se o pagamento foi aprovado, desbloqueia o sistema!
      if (detalhesPagamento.status === 'approved') {
        const idUsuario = detalhesPagamento.external_reference; // É o tenantId do cliente

        if (idUsuario) {
          console.log(`[SUCESSO] Pagamento Aprovado! Atualizando usuário: ${idUsuario}`);
          
          // Entra no Firebase e muda o status da assinatura na hora
          await db.collection('usuarios_app').doc(idUsuario).update({
            status_assinatura: 'ativo'
          });
          
          console.log('Cliente desbloqueado com sucesso!');
        }
      }
    }
  } catch (error) {
    console.error('Erro no Webhook:', error);
  }
}