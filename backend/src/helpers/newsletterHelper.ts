export function obterMesAnoAtual(): string {
  const data = new Date();
  // Retorna algo como "maio de 2026"
  return data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function gerarHtmlNewsletter(
  inscrito: { nome: string; email: string },
  linhasGrid: any[],
  animaisMap: Map<number, any>,
  conteudosMap: Map<number, any>
): string {
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head><meta charset="UTF-8"><title>Newsletter Focinho Amigo</title></head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, sans-serif; color: #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 20px 0;">
            <tr><td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
                    <tr>
                        <td align="center" style="background-color: #0284c7; padding: 25px 20px;">
                            <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 22px;">🐾 Focinho Amigo</h1>
                            <div style="display: inline-block; background-color: #f59e0b; color: #ffffff; font-size: 10px; font-weight: bold; padding: 3px 10px; border-radius: 20px; text-transform: uppercase;">
                                Edição Semanal • ${obterMesAnoAtual()}
                            </div>                            
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 25px 25px 15px 25px;">
                            <h2 style="font-size: 18px; color: #0f172a; margin: 0 0 8px 0;">Olá, ${inscrito.nome}! 👋</h2>
                            <p style="font-size: 13px; line-height: 1.4; color: #475569; margin: 0;">
                                Confira o resumo das nossas ações, animais que precisam de um lar e atualizações da nossa comunidade.
                            </p>
                        </td>
                    </tr>
                    <tr><td style="padding: 0 20px 20px 20px;">
  `;

  for (const linha of linhasGrid) {
    htmlContent += `<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 15px;"><tr>`;
    for (const item of linha) {
      htmlContent += `<td width="50%" valign="top" style="padding: 0 6px;">`;

      if (item.animal_id !== null) {
        const animal: any = animaisMap.get(item.animal_id);
        if (animal) {
          const fotoUrl = animal.imagem || 'https://via.placeholder.com/400x300?text=Sem+Foto';
          htmlContent += `
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <tr><td height="130"><img src="${fotoUrl}" style="width: 100%; height: 130px; object-fit: cover; display: block;" /></td></tr>
                <tr><td height="120" valign="top" style="padding: 12px;">
                    <div style="display: inline-block; background-color: #e0f2fe; color: #0369a1; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;">🐾 PARA ADOÇÃO</div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #0f172a;">${animal.nome}</h3>
                    <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0;">${animal.idade || 0}a • ${animal.especie} • ${animal.porte || ''}</p>
                    <p style="font-size: 12px; color: #334155; margin: 0; max-height: 36px; overflow: hidden;">${animal.sobre || 'Sem descrição.'}</p>
                </td></tr>
                <tr><td style="padding: 0 12px 12px 12px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="background-color: #0284c7; border-radius: 4px;">
                        <a href="http://localhost:5173/adocao?animal=${animal.id}" style="font-size: 12px; color: #ffffff; text-decoration: none; padding: 7px 0; display: block; font-weight: bold;">Conhecer →</a>
                    </td></tr></table>
                </td></tr>
            </table>`;
        }
      } else if (item.conteudo_id !== null) {
        const conteudo: any = conteudosMap.get(item.conteudo_id);
        if (conteudo) {
          const fotoUrl = conteudo.imagem || 'https://via.placeholder.com/400x300?text=Sem+Foto';
          htmlContent += `
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <tr><td height="130"><img src="${fotoUrl}" style="width: 100%; height: 130px; object-fit: cover; display: block;" /></td></tr>
                <tr><td height="120" valign="top" style="padding: 12px;">
                    <div style="display: inline-block; background-color: #fef3c7; color: #d97706; font-size: 10px; font-weight: bold; padding: 2px 8px; border-radius: 4px; margin-bottom: 8px;">📢 ${conteudo.categoria?.toUpperCase() || 'NOTÍCIA'}</div>
                    <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #0f172a;">${conteudo.titulo}</h3>
                    <p style="font-size: 12px; color: #475569; margin: 0; max-height: 36px; overflow: hidden;">${conteudo.resumo || 'Sem resumo.'}</p>
                </td></tr>
                <tr><td style="padding: 0 12px 12px 12px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" style="background-color: #0284c7; border-radius: 4px;">
                        <a href="http://localhost:5173/campanhas-e-noticias/${conteudo.id}" style="font-size: 12px; color: #ffffff; text-decoration: none; padding: 7px 0; display: block; font-weight: bold;">Ler Mais →</a>
                    </td></tr></table>
                </td></tr>
            </table>`;
        }
      }
      htmlContent += `</td>`;
    }
    if (linha.length === 1) htmlContent += `<td width="50%"></td>`;
    htmlContent += `</tr></table>`;
  }

  htmlContent += `
                    </td></tr>
                    <tr>
                        <td align="center" style="background-color: #0f172a; padding: 25px 20px; color: #94a3b8; font-size: 11px;">
                            <p style="margin: 0 0 6px 0; font-weight: bold; color: #cbd5e1;">Associação Protetora de Animais Focinho Amigo</p>
                            <p style="margin: 0 0 10px 0;">Indaiatuba - SP</p>
                            <p style="margin: 0;">
                                <a href="http://localhost:3000/api/newsletter/unsubscribe?email=${inscrito.email}" style="color: #94a3b8; text-decoration: underline;">
                                    Descadastrar-se da Newsletter
                                </a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td></tr>
        </table>
    </body>
    </html>
  `;

  return htmlContent;
}