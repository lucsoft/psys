import type { WebGen } from '@lucsoft/webgen';
import { formatPointsEntry } from '../tools';

export const renderHistory = (web: WebGen) =>
{
    const { span } = web.elements.none().components;
    if (typeof localStorage.psysTable == "undefined")
    {
        return [ { left: span(`Lade Einträge...`) } ];
    } else
    {
        const table = JSON.parse(localStorage.psysTable);
        if (table.length == 0)
            return [ { left: span(`Es gibt noch keine Einträge`) } ];
        return table.map((x: { change: number; from: string; id: number; typeId: string; }) =>
        {
            const type = localStorage.psysTypes ? JSON.parse(localStorage.psysTypes)[ x.typeId ] : 'Lade Einträge...';
            return ({
                left: formatPointsEntry(
                    !Number.isNaN(Number(x.typeId)) ?
                        (type ?? 'Suche nach Punktetyp...') : x.typeId, x.from, web),
                right: span(x.change > 0 ? `+ ${x.change.toLocaleString()}` : `- ${x.change.toLocaleString()}`),
            })
        })

    }
}
