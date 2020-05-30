import type { WebGen } from '@lucsoft/webgen';
import { APITypesAdd, APITypesRemove } from '../fetch/types';

export function renderManagePointsTypes({ web, canvas }: { canvas: HTMLElement, web: WebGen })
{
    let types: string[] = JSON.parse(localStorage.psysTypes);
    const { span, list, multiStateSwitch, action, input } = web.elements.none().components;
    const newType = input({ placeholder: "Neuer Punktetype", width: "10rem" });

    const spanCenterd = (text: string): HTMLElement =>
    {
        const spanc = span(text);
        spanc.style.display = "flex";
        spanc.style.height = "1.6rem";
        spanc.style.alignItems = "center";
        return spanc;
    }
    const checkAndCreate = async () =>
    {
        if (newType.value == "")
            return;
        if (types.includes(newType.value))
        {
            web.elements.notify(`${newType.value} gibt es bereits`);
            return;
        }

        web.elements.notify(`${newType.value} wird hinzugefügt...`);
        await APITypesAdd(newType.value);

        web.elements.notify(`${newType.value} wurde hinzugefügt`);
        action(typelist, "value", refreshList());
    }
    newType.onkeydown = (ev: KeyboardEvent) =>
    {
        if (ev.key == "Enter")
            checkAndCreate();
    }
    let check = false;
    const refreshList = (): any[] =>
    {
        types = JSON.parse(localStorage.psysTypes);
        return [ ...types.map((x, i) => ({
            left: spanCenterd(x),
            actions: (types.length - 1) == i ? [ {
                type: 'delete',
                click: async () =>
                {
                    if (!check)
                    {
                        web.elements.notify('Sicher? Klicke erneut um zu bestätigen');
                        check = true;
                        return;
                    }
                    check = false;
                    await APITypesRemove(types[ i ]);
                    web.elements.notify(`${x} wurde gelöscht`);
                    action(typelist, "value", refreshList());
                }
            } ] : undefined
        })), {
            left: newType,
            right: multiStateSwitch("small", {
                title: "Hinzufügen",
                action: () => checkAndCreate()
            })
        } ];
    }
    const typelist = list({}, ...refreshList());

    web.elements.custom(canvas).window({
        maxWidth: '50rem',
        title: 'Punktetypen verwalten',
        content: [ typelist ]
    })
}