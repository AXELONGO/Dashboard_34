import { Client } from '@notionhq/client';
import { processHistory, processLeads } from '../utils/notionMappers.js';

const env = process.env;

const notion = new Client({ auth: env.NOTION_API_KEY });

const ids = {
  leads: env.NOTION_DATABASE_ID,
  history: env.NOTION_HISTORY_DB_ID,
  clients: env.NOTION_CLIENTS_DB_ID,
  clientsHistory: env.NOTION_CLIENTS_HISTORY_DB_ID,
  support: env.NOTION_SUPPORT_DB_ID
};

const requireId = (databaseId, label) => {
  if (!databaseId) throw new Error(`${label} no configurado.`);
};

const queryAll = async (databaseId, options = {}) => {
  requireId(databaseId, 'Notion database id');

  let hasMore = true;
  let cursor;
  const results = [];

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 100,
      start_cursor: cursor,
      ...options
    });

    results.push(...(response.results ?? []));
    hasMore = Boolean(response.has_more);
    cursor = response.next_cursor ?? undefined;
  }

  return results;
};

const normalizeDate = (value) => (typeof value === 'string' && value.length ? value : undefined);

const historyQueryOptions = (startDate, endDate) => {
  const from = normalizeDate(startDate);
  const to = normalizeDate(endDate);

  const filters = [];
  if (from) filters.push({ timestamp: 'created_time', created_time: { on_or_after: from } });
  if (to) filters.push({ timestamp: 'created_time', created_time: { on_or_before: to } });

  return {
    sorts: [{ timestamp: 'created_time', direction: 'descending' }],
    ...(filters.length === 1 ? { filter: filters[0] } : {}),
    ...(filters.length > 1 ? { filter: { and: filters } } : {})
  };
};

export const getLeads = async () => processLeads(await queryAll(ids.leads));
export const getClients = async () => processLeads(await queryAll(ids.clients));

export const getHistory = async (startDate, endDate) =>
  processHistory(await queryAll(ids.history, historyQueryOptions(startDate, endDate)));

export const getClientsHistory = async (startDate, endDate) =>
  processHistory(await queryAll(ids.clientsHistory, historyQueryOptions(startDate, endDate)));

const leadProperties = (lead) => ({
  Name: { title: [{ text: { content: String(lead?.name ?? '') } }] },
  Dirección: { rich_text: [{ text: { content: String(lead?.address ?? '') } }] },
  Teléfono: { phone_number: lead?.phone ?? null },
  Website: { url: lead?.website ?? null },
  Clase: { select: { name: String(lead?.clase ?? 'C') } },
  Responsable: { select: { name: String(lead?.agent ?? 'Sin Asignar') } }
});

export const createLead = async (lead) => {
  requireId(ids.leads, 'NOTION_DATABASE_ID');

  return notion.pages.create({
    parent: { database_id: ids.leads },
    properties: leadProperties(lead)
  });
};

export const createClient = async (client) => {
  requireId(ids.clients, 'NOTION_CLIENTS_DB_ID');

  return notion.pages.create({
    parent: { database_id: ids.clients },
    properties: leadProperties(client)
  });
};

const createHistoryForDatabase = async (databaseId, { leadId, clientId, text, agent, interactionType }) => {
  requireId(databaseId, 'History database id');

  const db = await notion.databases.retrieve({ database_id: databaseId });
  const props = db.properties ?? {};
  const keys = Object.keys(props);

  const titleKey = keys.find((k) => props[k].type === 'title') ?? 'Asesor';
  const relationKey = keys.find((k) => props[k].type === 'relation') ?? 'Cliente';
  const commentKey = keys.find((k) => /comentario|detalle|descri/i.test(k)) ?? 'Comentario';
  const contactKey = keys.find((k) => /contacto|prospeccion/i.test(k)) ?? 'Contacto';
  const dateKey = keys.find((k) => /fecha|date/i.test(k));

  const targetId = leadId || clientId;
  const payload = {
    [titleKey]: { title: [{ text: { content: String(agent ?? 'Sistema') } }] },
    [contactKey]: { rich_text: [{ text: { content: String(interactionType ?? 'Nota') } }] },
    [commentKey]: { rich_text: [{ text: { content: String(text ?? '') } }] }
  };

  if (props[relationKey]?.type === 'relation' && targetId) {
    payload[relationKey] = { relation: [{ id: String(targetId) }] };
  }

  if (dateKey) payload[dateKey] = { date: { start: new Date().toISOString() } };

  return notion.pages.create({
    parent: { database_id: databaseId },
    properties: payload
  });
};

export const createHistory = async (data) => createHistoryForDatabase(ids.history, data ?? {});
export const createClientHistory = async (data) => createHistoryForDatabase(ids.clientsHistory, data ?? {});

export const updatePage = async (pageId, { properties, archived = false }) => {
  if (!pageId) throw new Error('pageId es requerido');

  return notion.pages.update({
    page_id: pageId,
    properties: properties ?? {},
    archived: Boolean(archived)
  });
};

export const getSupportTickets = async () => {
  if (!ids.support) return [];

  return queryAll(ids.support, {
    sorts: [{ timestamp: 'created_time', direction: 'descending' }]
  });
};
