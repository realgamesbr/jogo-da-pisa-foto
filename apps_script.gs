/**
 * Vinhos de Portugal 2026 — Captura de Leads (Jogo da Pisa)
 * Google Apps Script — Web App endpoint
 *
 * SETUP:
 * 1. Crie uma Google Sheet nova
 * 2. Abra Extensões > Apps Script
 * 3. Cole este código no editor
 * 4. Ajuste SHEET_NAME se mudou o nome da aba (default: "Eventos")
 * 5. Salve. Implementar > Nova implementação > Tipo: Web app
 *    - Executar como: Eu
 *    - Quem tem acesso: Qualquer pessoa
 * 6. Copie a URL do Web App e cole no HTML em APPS_SCRIPT_URL
 *
 * SHEET HEADERS (linha 1) — criar manualmente antes de rodar:
 * timestamp | event | email | consent_marketing | consent_privacy | photo_id | user_agent
 *
 * COLUNA "event":
 *   - "lead" = visitante deixou email
 *   - "skip" = visitante optou por nao deixar email (clicou "Nao quero")
 */

const SHEET_NAME = 'Eventos';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const event = (data.event || 'lead').toLowerCase();

    // Validacao: se for "lead", email obrigatorio. Se "skip", email pode estar vazio.
    if (event === 'lead') {
      if (!data.email || !isValidEmail(data.email)) {
        return jsonResponse({ ok: false, error: 'Email invalido' });
      }
    } else if (event !== 'skip') {
      return jsonResponse({ ok: false, error: 'Evento desconhecido: ' + event });
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, error: 'Sheet "' + SHEET_NAME + '" nao encontrada' });
    }

    // Garante headers se a sheet estiver vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'timestamp', 'event', 'email', 'consent_marketing',
        'consent_privacy', 'photo_id', 'user_agent'
      ]);
    }

    // Adiciona linha
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      event,
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
  // Endpoint GET so pra teste rapido
  return jsonResponse({ ok: true, msg: 'Endpoint Vinhos de Portugal ativo' });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
