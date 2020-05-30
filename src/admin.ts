import type { WebGen } from '@lucsoft/webgen';
import { renderCreateAccount } from './adminSubViews/createAccount';
import { renderManagePointsTypes } from './adminSubViews/managePointsTypes';
import { renderUserProfile } from './adminSubViews/userProfile';

export function renderAdmin(web: WebGen, list: any[])
{
    const area = document.createElement('article');

    renderActions(area, web);
    const max = Math.max(...list.map(x => x.currentpoints))
    const min = Math.min(...list.map(x => x.currentpoints))
    const search = web.elements.fixedWindow(true, true).search({
        type: "smart",
        maxWidth: "50rem",
        placeholder: 'Suchen...',
        mode: "hideBegin",
        actions: {
            close: () => { web.elements.fixedWindow(false, false) },
            click: (entry) =>
            {
                const user: any = list.find(x => x.id == entry.id);
                area.innerHTML = "";
                renderUserProfile({
                    create: user.create,
                    email: user.email,
                    id: entry.id,
                    isAdmin: user.admin,
                    name: user.name,
                    currentpoints: user.currentpoints,
                    street: user.street,
                    history: user.history
                }, area, web);
            }
        },
        index: list.map((x) =>
            ({
                id: x.id,
                name: x.name.join(' '),
                tags: [ x.email.includes('platzhalter') ? 'write-only' : undefined, x.admin ? 'admin' : undefined, x.currentpoints === min ? 'lowest' : undefined, x.currentpoints === max ? 'highest' : undefined ].filter(x => x != undefined) as string[]
            }))
    });
    const last = search.last.querySelector('input');
    const test = list.filter(x => x.email.includes('platzhalter')).length;


    last?.addEventListener("input", () =>
    {
        if (last.value === "")
        {
            area.innerHTML = "";
            renderActions(area, web);
        }
    })
    search.custom({ element: area });
    if (test > 1)
        web.elements.notify(`${list.filter(x => x.email.includes('platzhalter')).length} User sind Unvollständig!`);

}

function renderActions(area: HTMLElement, web: WebGen)
{
    const subArea = document.createElement("article");
    web.elements.custom(area).cardButtons({
        columns: "auto",
        maxWidth: "50rem",
        list: [
            {
                id: 'createAccount',
                title: "Accounts",
                value: "Erstellen sie hier Accounts",
                onClick: (toggle, state) =>
                {
                    document.querySelector('#changePointTypes')?.classList?.remove?.('active')
                    toggle('Erstellen sie hier Accounts')
                    subArea.innerHTML = "";
                    if (!state)
                        renderCreateAccount(subArea, web);
                }
            },
            {
                id: 'changePointTypes',
                title: "Punktetypen",
                value: "Verwalten sie hier Punktetypen",
                onClick: (toggle, state) =>
                {
                    toggle('Verwalten sie hier Punktetypen')
                    document.querySelector('#createAccount')?.classList?.remove?.('active')
                    subArea.innerHTML = "";
                    if (!state)
                        renderManagePointsTypes({ canvas: subArea, web });
                }
            }

        ]
    }).custom({ element: subArea })
}
