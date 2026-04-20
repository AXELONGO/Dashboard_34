import test from 'node:test';
import assert from 'node:assert/strict';
import { processHistory, processLeads } from './notionMappers.js';

test('processLeads maps notion result with safe defaults', () => {
  const data = [
    {
      id: 'lead_1',
      properties: {
        Name: { type: 'title', title: [{ plain_text: 'Empresa A' }] },
        Dirección: { rich_text: [{ plain_text: 'Zona Centro' }] },
        Teléfono: { phone_number: '+52 555 111 2222' },
        Clase: { type: 'select', select: { name: 'A' } },
        Responsable: { select: { name: 'Asesor 1' } }
      }
    }
  ];

  const leads = processLeads(data);
  assert.equal(leads.length, 1);
  assert.equal(leads[0].id, 'lead_1');
  assert.equal(leads[0].name, 'Empresa A');
  assert.equal(leads[0].clase, 'A');
  assert.equal(leads[0].agent, 'Asesor 1');
});

test('processHistory extracts relation and metadata', () => {
  const data = [
    {
      id: 'hist_1',
      created_time: '2026-04-20T10:00:00Z',
      properties: {
        Asesor: { type: 'title', title: [{ plain_text: 'Ana' }] },
        Contacto: { rich_text: [{ plain_text: 'Llamada' }] },
        Comentario: { rich_text: [{ plain_text: 'Cliente interesado' }] },
        Cliente: { type: 'relation', relation: [{ id: 'lead_1' }] }
      }
    }
  ];

  const history = processHistory(data);
  assert.equal(history.length, 1);
  assert.equal(history[0].clientId, 'lead_1');
  assert.equal(history[0].type, 'call');
  assert.equal(history[0].user.name, 'Ana');
});
