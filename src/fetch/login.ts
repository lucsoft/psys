import type { WebGen } from '@lucsoft/webgen';
export const APITypes = async (web: WebGen, myHistory: HTMLElement, renderHistory: (web: WebGen) => void) =>
{
    const { action } = web.elements.none().components;

    fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
        method: "POST",
        body: JSON.stringify({
            type: "types",
            email: localStorage.psysEmail,
            password: localStorage.psysPassword
        })
    }).then(async (rsp) =>
    {
        const data = await rsp.text();
        if (localStorage.psysTypes != data)
        {
            localStorage.psysTypes = data;
            action(myHistory, "value", renderHistory(web));
        }
    });
};
export const APILogin = async (web: WebGen, myHistory: HTMLElement, renderHistory: (web: WebGen) => void, pageTitle: HTMLElement, refresh: (data: any) => void) =>
{
    const { action } = web.elements.none().components;

    fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
        method: "POST",
        body: JSON.stringify({
            type: "login",
            email: localStorage.psysEmail,
            password: localStorage.psysPassword
        })
    }).then(async (rsp) =>
    {
        const login = await rsp.json();
        if (login.login == false)
        {
            localStorage.clear();
            location.href = location.href;
        }
        if (localStorage.psysCurrentPoints !== undefined && localStorage.psysCurrentPoints != login.user.currentpoints)
        {
            const diff = login.user.currentpoints - localStorage.psysCurrentPoints;
            if (diff > 0)
                web.elements.notify(`${login.user.currentpoints - localStorage.psysCurrentPoints} Punkt${diff > 1 ? 'e sind' : ' ist'} dazu gekommen!`)
            else
                web.elements.notify(`${-(login.user.currentpoints - localStorage.psysCurrentPoints)} Punkt${-diff > 1 ? 'e würden' : ' wurde'} abgezogen.`)

        }
        localStorage.psysTable = JSON.stringify(login.user.history);
        action(myHistory, "value", renderHistory(web));

        localStorage.psysCurrentPoints = login.user.currentpoints;
        action(pageTitle, "value", `DU HAST ${login.user.currentpoints} PUNKT${login.user.currentpoints <= 1 ? '' : 'E'}`)
        if (localStorage.psysIsAdmin == undefined && login.user.admin == true)
        {
            localStorage.psysIsAdmin = "true";
            location.href = location.href;
        }
        refresh(login.user);
    })

}