# Jogo da Pisa — Página de Foto + Captura de Lead

Demonstração da página exibida ao visitante após escanear o QR Code no estande do Jogo da Pisa, evento Vinhos de Portugal 2026 (SP + RJ).

**Live demo (GitHub Pages):** veja `index.html` deste repo via Pages.

## Fluxo

1. Visitante escaneia QR Code no estande
2. Página abre no celular com convite para deixar email
3. Pode preencher email + consentimentos OU pular ("Não quero deixar meu email")
4. Foto aparece em ambos os casos, com botão de download
5. Backend (Google Sheets via Apps Script) registra lead OU skip para métricas

## Conformidade LGPD

- Email opcional (botão "Não quero")
- Consentimento de marketing separado e não pré-marcado
- Política de Privacidade linkada
- Apenas leads com `consent_marketing = TRUE` podem ser contatados

## Arquivos

| Arquivo | Função |
|---------|--------|
| `index.html` | Página de teste (versão atual no Pages) |
| `photo_view.html` | Versão de produção (placeholders pra hospedar) |
| `politica_privacidade.html` | Política linkada |
| `apps_script.gs` | Backend Google Apps Script |
| `SETUP.md` | Guia de instalação / deploy |
| `serve_test.py` | Servidor local pra desenvolvimento |
