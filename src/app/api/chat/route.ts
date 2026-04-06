import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/lib/supabase/server';

const ai = process.env.GEMINI_API_KEY 
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json(); // Array de todas as mensagens para manter contexto!

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Busca o histórico do usuário para dar contexto à IA
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, category, description, type, created_at')
      .eq('user_id', user?.id || '00000000-0000-0000-0000-000000000000')
      .order('created_at', { ascending: false })
      .limit(30);

    const txContext = transactions && transactions.length > 0 
      ? transactions.map(tx => `- ${new Date(tx.created_at).toLocaleDateString('pt-BR')}: ${tx.type === 'expense' ? 'Gasto' : 'Ganho'} de R$ ${tx.amount} (${tx.category}) - ${tx.description}`).join("\n")
      : "Nenhum histórico de transação.";

    if (!ai) return NextResponse.json({ error: "Gemini Missing" }, { status: 500 });
    
    // Constrói o contexto em formato Content array que o Gemini espera nativamente
    // Pega todas as mensagens e mapeia o history. Se a mensagem do user tiver Base64Image, a gente repassa pro inlineData
    const mappedContents: any[] = messages.map((m: any) => {
      const parts: any[] = [{ text: m.content || "Sem texto explícito (Imagem)" }];
      
      // Se houver anexo de imagem base64 na mensagem:
      if (m.base64Image) {
        // o front-end envia ex: "data:image/jpeg;base64,...base..."
        const match = m.base64Image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (match) {
           parts.push({
             inlineData: {
               mimeType: match[1],
               data: match[2]
             }
           });
        }
      }
      return {
        role: m.role === 'assistant' ? 'model' : 'user', // genai SDK usa 'model' e 'user'
        parts
      }
    });

    const currentDate = new Date().toLocaleDateString('pt-BR');
    const systemPrompt = `Você é um assistente financeiro inteligente. O usuário enviará mensagens em linguagem natural ou imagens de recibos/notas fiscais.
Hoje é dia ${currentDate}. Use essa data para expressões temporais. Você tem memória das mensagens anteriores nesta requisição.

**INSTRUÇÕES IMPORTANTES PARA IMAGENS (OCR) OU PEDIDOS DE CONFIRMAÇÃO:**
Você NUNCA deve gravar/registrar diretamente sem antes confirmar com o usuário quando as informações vierem de um Recibo ou quando o usuário falar de forma corrida sem certeza. 
Se você detectar que a última mensagem do usuário (ou antes) traz uma foto de nota fiscal, ou dados confusos, siga estritamente essa lógica:
1. Extraia o TIPO, VALOR, CATEGORIA e DESCRIÇÃO (Estabelecimento).
2. Devolva um JSON ACTION: "query" formatado assim:
   "reply": "Encontrei um gasto de R$ XX no [Estabelecimento] para classificar como [Categoria]. Posso confirmar e registrar isso para você?"
3. SOMENTE QUANDO O USUÁRIO RESPONDER "Sim", "Pode", "Ok" no PRÓXIMO turno (com memória no histórico), você devolverá a ACTION: "register" preenchendo todos os dados perfeitamente no objeto data. 
Se o usuário responder "Não, foi R$ 50", ajuste os valores de seu entendimento e crie a ACTION "register" com os dados corrigidos da frase dele!

Aqui está o histórico consolidado de transações do banco do usuário (já computadas lá. Nao comente sobre elas amenos que ele peça 'quanto gastei'):
${txContext}

Sua resposta FINAL deves ser SEMPRE estruturada estritamente neste JSON, sem Markdown adicionais em volta do {} json raiz:

Se a interação exige apenas Resposta, Confirmação Pendente ou Conversação (Action Query):
{
  "action": "query",
  "reply": "A pergunta confirmando os dados OU sua resposta de conversa normal"
}

Se a pessoa já deu ok explícito ("Sim", "Registra") para a sua confirmação, ou digitou explicitamente a ordem clara ("Gastei 50 no bk hoje"):
{
  "action": "register",
  "data": {
    "amount": 100.50,
    "category": "Alimentação",
    "description": "Pizza",
    "type": "expense", // ou "income"
    "date": "2026-04-06T12:00:00Z"
  },
  "reply": "Pronto! O registro de R$ 100,50 🍕 foi feito com sucesso no banco."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: mappedContents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text || "{}");

    // Registro Destrutivo no BD apenas se a ACTION for de fato Register
    if (parsed.action === "register" && parsed.data) {
      const transactionData: any = {
        amount: parsed.data.amount,
        category: parsed.data.category,
        description: parsed.data.description,
        type: parsed.data.type,
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
      };
      if (parsed.data.date) transactionData.created_at = parsed.data.date;

      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url_here') {
        const { error } = await supabase.from('transactions').insert([transactionData]);
        if (error) console.error("DB Insert Error", error);
        else parsed.reply = parsed.reply || `Ok, registrei a transação de R$ ${transactionData.amount}!`;
      }
    }

    if (parsed.action === 'query' && !parsed.reply) {
        parsed.reply = "Tive uma falha temporária ao gerar a próxima instrução.";
    }

    return NextResponse.json({ success: true, ...parsed });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
