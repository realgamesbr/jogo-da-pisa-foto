# Setup — Captura de Leads Jogo da Pisa

Pacote completo: HTML + Apps Script + Política de Privacidade. Funciona com Google Sheets como banco de leads.

## Visão Geral

```
[Visitante escaneia QR no estande]
          ↓
[Abre photo_view.html] → vê form de captura
          ↓
[Digita email + checks] OU [clica "Não quero deixar email"]
          ↓
[Form posta JSON pro Apps Script Web App]
          ↓
[Apps Script salva linha na Google Sheet]
          ↓
[HTML mostra a foto + botão Baixar]
```

## Arquivos do pacote

- `photo_view.html` — página principal exibida ao escanear o QR
- `politica_privacidade.html` — política linkada no checkbox de consentimento
- `apps_script.gs` — código pra colar no Google Apps Script (backend de captura)
- `SETUP.md` — este guia

---

## Passo 1 — Criar a Google Sheet

1. Acesse [sheets.google.com](https://sheets.google.com) → Nova planilha
2. Renomeie pra **"Vinhos de Portugal 2026 — Eventos Jogo da Pisa"**
3. Renomeie a aba (canto inferior) de "Página1" pra **`Eventos`**
4. Na linha 1, adicione os headers manualmente:

   | A | B | C | D | E | F | G |
   |---|---|---|---|---|---|---|
   | timestamp | event | email | consent_marketing | consent_privacy | photo_id | user_agent |

5. Formate a linha 1 em negrito + freeze (Exibir > Congelar > 1 linha)

**Sobre a coluna `event`:**
- `lead` = visitante deixou email
- `skip` = visitante clicou "Não quero deixar meu email"

Isso permite contagem total de uso (lead + skip = total de fotos visualizadas) e cálculo de taxa de conversão (lead / total).

## Passo 2 — Configurar o Apps Script

1. Na Sheet, **Extensões > Apps Script**
2. Apaga o código padrão (`function myFunction()...`)
3. Copia todo o conteúdo de `apps_script.gs` e cola
4. Salva (ícone de disquete ou Ctrl+S) — dá um nome ao projeto: "Captura Leads Vinhos"
5. Clique em **Implantar > Nova implantação**
6. Tipo (engrenagem ao lado de "Selecionar tipo"): **Aplicativo da Web**
7. Configure:
   - **Descrição:** "Captura de leads Jogo da Pisa"
   - **Executar como:** "Eu (seu-email@gmail.com)"
   - **Quem pode acessar:** **Qualquer pessoa** (importante)
8. Clique **Implantar**
9. Autorize quando o Google pedir (vai mostrar aviso de "app não verificado" — clicar "Avançado > Acessar mesmo assim")
10. **Copie a URL do Web App** que aparece após implantar — ela tem este formato:
    ```
    https://script.google.com/macros/s/AKfycb...../exec
    ```

## Passo 3 — Configurar o HTML

Abra `photo_view.html` e ajuste:

### 3.1 — URL do Apps Script

Localize esta linha no script (perto de // CONFIGURACAO):
```javascript
const APPS_SCRIPT_URL = 'COLE_AQUI_A_URL_DO_APPS_SCRIPT_WEB_APP';
```
Substitua pela URL do passo 2.10.

### 3.2 — Logos

Localize as duas tags `<img>` no `<div class="header">`:

```html
<img class="logo-game"
     src="https://realgamesstudio.com.br/images/jogo_da_pisa_logo.png"
     alt="Jogo da Pisa" />
<img class="logo-client"
     src="https://realgamesstudio.com.br/images/cliente_logo_placeholder.png"
     alt="Cliente" />
```

Substitua os `src` pelas URLs reais hospedadas. Se ainda não hospedou, faça upload do logo do jogo (`Arte game/LOGO Jogo da pisa v1.png`) e do logo do cliente para o servidor da Real Games Studio (ou outro CDN).

## Passo 4 — Configurar a Política de Privacidade

Abra `politica_privacidade.html` e substitua os campos `[ENTRE_COLCHETES]`:

- `[NOME DO CONTROLADOR]` — quem coleta os dados (cliente ou organizador)
- `[CNPJ]` — CNPJ do controlador
- `[email-de-contato@cliente.com]` — email para o titular exercer direitos
- `[Nome do DPO ou responsável]` + `[dpo@cliente.com]` — encarregado de dados
- `[Data de publicação]` — data em que entrou em vigor

## Passo 5 — Hospedar e Gerar QR Codes

A página `photo_view.html` é gerada **uma por foto**. O sistema que captura a foto no estande precisa:

1. Salvar a foto em algum lugar acessível (CDN, Google Drive público, S3, etc.)
2. Gerar uma cópia do `photo_view.html` por foto, **substituindo `{{media_placeholder}}`** pela URL real da foto
3. Hospedar esse HTML único e gerar QR code apontando pra ele

Exemplo de URL final:
```
https://realgamesstudio.com.br/vp2026/photo_abc123.html
```

Onde `abc123` é o `photo_id`.

> **Nota:** O sistema atual já usa template idêntico (`bancovolks html base.txt`), então o pipeline existente de geração de QR/HTML serve. Só trocar o template-base por este novo.

## Passo 6 — Teste

1. Abra a URL do HTML no navegador
2. Preencha email + marque privacy
3. Clique "Ver Foto" → vai mostrar a foto
4. Volte na Sheet — deve ter aparecido a linha do lead
5. Repita com "Não quero deixar email" → não deve aparecer linha (skip)
6. Recarregue a página com a mesma URL → deve ir direto pra foto (localStorage lembra)

## LGPD — Pontos importantes

- **Email é opcional** — o botão "Não quero deixar meu email" funciona em qualquer caso
- **Consentimento de marketing é separado** do checkbox de privacidade — só vira lead quem **marcar o de marketing**
- **Quem não marcar marketing mas deixou email** fica registrado, mas **NÃO PODE receber comunicação posterior** (apenas evidência de consentimento da política)
- **Para exportar leads de marketing**, filtrar a coluna `consent_marketing = TRUE`
- **Em caso de pedido de descadastro**, marcar a linha como excluída ou apagar a linha — manter registro da solicitação

## Métricas / Analytics

Fórmulas úteis pra colocar numa aba "Métricas" da Sheet:

| Métrica | Fórmula |
|---------|---------|
| Total de fotos vistas | `=COUNTA(Eventos!A2:A)` |
| Leads capturados | `=COUNTIF(Eventos!B2:B, "lead")` |
| Skips (não deixou email) | `=COUNTIF(Eventos!B2:B, "skip")` |
| Taxa de conversão | `=COUNTIF(Eventos!B2:B,"lead")/COUNTA(Eventos!A2:A)` |
| Leads c/ consentimento marketing | `=COUNTIFS(Eventos!B2:B,"lead",Eventos!D2:D,TRUE)` |
| Taxa opt-in marketing | `=COUNTIFS(Eventos!B2:B,"lead",Eventos!D2:D,TRUE)/COUNTIF(Eventos!B2:B,"lead")` |

## Exportar para Mailchimp / RD Station / HubSpot

1. Filtre a Sheet: `event = lead` E `consent_marketing = TRUE`
2. Exporte como CSV (Arquivo > Download > CSV)
3. Importe na ferramenta — mapear colunas: `email` → email, `timestamp` → data de cadastro

**Importante:** só exportar quem tem `consent_marketing = TRUE`. Quem deixou email mas não marcou marketing **não pode** receber comunicação posterior.

## Limites e quotas

- Apps Script: 20.000 chamadas/dia (mais do que suficiente para o evento)
- Google Sheets: até 10 milhões de células (~1.4M linhas — folga absurda)
- Latência típica do POST: 200-500ms (HTML não espera, é fire-and-forget)

## Troubleshooting

**"Sheet não encontrada":** verificar se a aba se chama exatamente `Leads`

**"Email inválido":** validação client-side, regex permite formato padrão

**Lead não aparece na Sheet:** verificar:
- URL do Apps Script no HTML está correta
- Web App está publicado com "Qualquer pessoa"
- Console do navegador (F12) mostra algum erro?

**Botão "Ver Foto" fica desabilitado:** precisa email válido + checkbox de privacidade marcado. O de marketing é opcional.
