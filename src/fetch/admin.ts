import type { WebGen } from '@lucsoft/webgen';

export const loadAdminpanel = (web: WebGen) =>
{
    web.elements.notify('Lade Adminpanel...');
    fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
        method: "POST",
        body: JSON.stringify({
            type: "list",
            email: localStorage.psysEmail,
            password: localStorage.psysPassword,
        })
    }).then(async (rsp) =>
    {
        const response = await rsp.json();
        (await import(/* webpackChunkName: "admin" */'../admin')).renderAdmin?.(web, response);
    })
}