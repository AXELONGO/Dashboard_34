const findKey = (keys, props, { regex, propType, defaultKey } = {}) => {
  for (const key of keys) {
    if (propType && props[key]?.type === propType) return key;
    if (regex && new RegExp(regex, 'i').test(key)) return key;
  }
  return defaultKey;
};

export const processLeads = (results = []) => {
  return results
    .map((page) => {
      const props = page?.properties ?? {};
      const keys = Object.keys(props);

      const titleKey = findKey(keys, props, { propType: 'title', defaultKey: 'Name' });
      const addressKey = findKey(keys, props, { regex: 'address|direcci|ubicaci' });
      const phoneKey = findKey(keys, props, { regex: 'phone|tel' });
      const webKey = findKey(keys, props, { regex: 'web|url' });
      const classKey = findKey(keys, props, { regex: 'clase|class' });
      const agentKey = findKey(keys, props, { regex: 'responsable|agent' });

      const name = props[titleKey]?.title?.[0]?.plain_text ?? 'Sin Nombre';
      const address = props[addressKey]?.rich_text?.[0]?.plain_text ?? 'Dirección no especificada';
      const phone = props[phoneKey]?.phone_number ?? props[phoneKey]?.rich_text?.[0]?.plain_text ?? '';
      const website = props[webKey]?.url ?? '';
      const clase = props[classKey]?.select?.name ?? props[classKey]?.rich_text?.[0]?.plain_text ?? 'C';
      const agent = props[agentKey]?.select?.name ?? 'Sin Asignar';

      return {
        id: page.id,
        name,
        address,
        phone,
        website,
        category: 'Otros',
        clase,
        agent,
        isSelected: false,
        isSynced: true,
        notionData: {
          claseColName: classKey ?? 'Clase',
          claseColType: props[classKey]?.type ?? 'select'
        }
      };
    })
    .filter(Boolean);
};

export const processHistory = (results = []) => {
  return results
    .map((page) => {
      const props = page?.properties ?? {};
      const keys = Object.keys(props);

      const titleKey = findKey(keys, props, { propType: 'title', defaultKey: 'Asesor' });
      const typeKey = findKey(keys, props, { regex: 'contacto|prospeccion', defaultKey: 'Contacto' });
      const descKey = findKey(keys, props, { regex: 'comentario|detalle|descri', defaultKey: 'Comentario' });
      const dateKey = findKey(keys, props, { regex: 'fecha|date' });

      const agentName = props[titleKey]?.title?.[0]?.plain_text ?? 'Sistema';
      const title =
        props[typeKey]?.rich_text?.[0]?.plain_text ?? props[typeKey]?.select?.name ?? 'Nota';
      const description = props[descKey]?.rich_text?.[0]?.plain_text ?? '';
      const dateStr = props[dateKey]?.date?.start ?? page.created_time;

      let clientId = null;
      for (const key of keys) {
        if (props[key]?.type === 'relation' && props[key]?.relation?.length) {
          clientId = props[key].relation[0].id;
          break;
        }
      }

      const date = new Date(dateStr);
      const timestamp = date.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      const tLower = String(title).toLowerCase();
      let itemType = 'note';
      if (tLower.includes('llamada') || tLower.includes('tel')) itemType = 'call';
      if (tLower.includes('mail') || tLower.includes('correo') || tLower.includes('what')) itemType = 'email';

      return {
        id: page.id,
        type: itemType,
        title,
        timestamp,
        isoDate: dateStr,
        description,
        user: { name: agentName, avatarUrl: '' },
        clientId,
        isSynced: true
      };
    })
    .filter(Boolean);
};
