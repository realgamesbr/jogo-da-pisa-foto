/**
 * RGS — Captura de Eventos / Leads (template reutilizavel)
 * Google Apps Script — Web App endpoint
 *
 * COMO REUTILIZAR PARA OUTRO GAME:
 * 1. Duplique a planilha (Arquivo > Fazer uma copia)
 * 2. Abra o Apps Script da copia
 * 3. Altere apenas a constante EXPECTED_GAME_ID abaixo
 * 4. Reimplante como novo Web App
 * 5. Use a nova URL no HTML do novo game
 *
 * EXPECTED_GAME_ID:
 * - Identifica o game/projeto que esta planilha aceita
 * - Eventos com game_id diferente sao REJEITADOS (nao salvos)
 * - Garante que cada planilha so contem dados do seu game
 *
 * SHEET HEADERS (linha 1):
 * timestamp | event | game_id | email | consent_marketing | consent_privacy | photo_id | user_agent
 *
 * COLUNA "event":
 *   - "lead" = visitante deixou email
 *   - "skip" = visitante optou por nao deixar email
 */

// ============================================================
// CONFIGURACAO — ajustar APENAS isto ao duplicar
// ============================================================
const EXPECTED_GAME_ID = 'vinhos_pisa_2026';
const SHEET_NAME = 'Eventos';
// ============================================================


function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1. Validar game_id — so aceita eventos do game configurado
    if (!data.game_id || data.game_id !== EXPECTED_GAME_ID) {
      return jsonResponse({
        ok: false,
        error: 'game_id invalido ou ausente. Esperado: ' + EXPECTED_GAME_ID
      });
    }

    // 2. Validar tipo de evento
    const event = (data.event || 'lead').toLowerCase();
    if (event !== 'lead' && event !== 'skip') {
      return jsonResponse({ ok: false, error: 'Evento desconhecido: ' + event });
    }

    // 3. Se for "lead", email obrigatorio. Se "skip", pode estar vazio.
    if (event === 'lead' && (!data.email || !isValidEmail(data.email))) {
      return jsonResponse({ ok: false, error: 'Email invalido' });
    }

    // 4. Pegar a sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'Sheet "' + SHEET_NAME + '" nao encontrada' });
    }

    // 5. Garantir headers se sheet vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'timestamp', 'event', 'game_id', 'email',
        'consent_marketing', 'consent_privacy', 'photo_id', 'user_agent'
      ]);
    }

    // 6. Adicionar linha
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      event,
      data.game_id,
      (data.email || '').trim().toLowerCase(),
      data.consent_marketing === true,
      data.consent_privacy === true,
      data.photo_id || '',
      data.user_agent || ''
    ]);

    return jsonResponse({ ok: true });

  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}


function doGet(e) {
  // Endpoint GET so pra teste rapido — abra a URL do Web App no browser
  return jsonResponse({
    ok: true,
    msg: 'Endpoint ativo',
    expected_game_id: EXPECTED_GAME_ID
  });
}


function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}


function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
