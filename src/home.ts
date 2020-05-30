import type { WebGen } from '@lucsoft/webgen';
import { loadAdminpanel } from './fetch/admin';
import { APILogin, APITypes } from './fetch/login';
import { renderHomeAbout } from './homeSubViews/about';
import { renderHistory } from './homeSubViews/history';
import { renderHomeSettings } from './homeSubViews/settings';

export async function renderHome(web: WebGen, admin: boolean)
{
    const article = document.createElement('article');
    const { list } = web.elements.none().components;

    let showAboutPSYS = false;
    const toggleHomeAbout = () =>
    {
        showAboutPSYS = !showAboutPSYS;
        accountSettings.style.transform = "translate(-100%, 0)";
        if (showAboutPSYS)
        {
            aboutPSYS.style.transform = "translate(0%, 0)";
            article.style.transform = "translate(-100%, 0)";
        } else
        {
            aboutPSYS.style.transform = "translate(100%, 0)";
            article.style.transform = "translate(0%, 0)";
        }
    }
    let showAccountSettings = false;
    const toggleHomeSettings = () =>
    {
        showAccountSettings = !showAccountSettings;
        aboutPSYS.style.transform = "translate(100%, 0)";
        if (showAccountSettings)
        {
            accountSettings.style.transform = "translate(0%, 0)";
            article.style.transform = "translate(100%, 0)";
        } else
        {
            accountSettings.style.transform = "translate(-100%, 0)";
            article.style.transform = "translate(0%, 0)";
        }
    };

    const title = web.elements.custom(article).pageTitle({
        maxWidth: '60rem',
        text: "Punktesystem"
    }).last;
    title.style.fontSize = "2rem";
    title.style.opacity = "0.6";
    title.style.marginBottom = "-1.5rem";

    const myHistory = list({}, ...renderHistory(web));
    let refresh = ({ }): void => { };
    const pageTitle = web.elements.custom(article).pageTitle({
        maxWidth: '60rem',
        text: `DU HAST ${localStorage.psysCurrentPoints ?? '•••'} PUNKT${localStorage.psysCurrentPoints ? (localStorage.psysCurrentPoints == 1 ? '' : 'E') : 'E'}`
    }).last;

    APILogin(web, myHistory, renderHistory, pageTitle, (data) => refresh(data));
    APITypes(web, myHistory, renderHistory);

    const history = web.elements.custom(article).cardButtons({
        maxWidth: '60rem',
        columns: "auto",
        list: [
            (admin ? {
                title: 'Punkte verwalten',
                value: 'Hier können auch Accounts verwaltet werden',
                id: 'addPoints',
                onClick: async () => loadAdminpanel(web)
            } : {
                    title: 'Admin kontaktieren',
                    id: 'call-admin',
                    onClick: () =>
                        window.open('mailto:webadmin@drkfurwangen.de', '_blank')
                }),
            {
                title: 'Accounteinstellung',
                id: 'settings',
                onClick: () => toggleHomeSettings()
            },
            {
                title: 'Übers Punktesystem',
                value: 'Weitere Infos über das Punktesystem',
                id: 'psys-about',
                onClick: () => toggleHomeAbout()
            }
        ]
    }).window({
        maxWidth: '60rem',
        title: 'Ihr Punkteverlauf',
        content: myHistory
    }).last;

    history.classList.add('noanimation')
    history.style.marginBottom = "3rem";

    const aboutPSYS = document.createElement('article');
    const accountSettings = document.createElement('article');

    article.style.position = "absolute";
    article.style.left = "0";
    article.style.right = "0";
    article.style.overflowY = "overlay";
    article.style.height = "100vh";
    article.style.transform = "translate(0%, 0)";
    article.style.transition = "transform 800ms cubic-bezier(0.87, 0.79, 0.07, 1.06)";
    const { APIUpdateAccount } = await import('./fetch/updateAccount');
    renderHomeAbout(aboutPSYS, web, () => toggleHomeAbout());
    refresh = renderHomeSettings(accountSettings, web, () => toggleHomeSettings(), async (update) =>
    {
        await APIUpdateAccount("3", update);
        await APILogin(web, myHistory, renderHistory, pageTitle, refresh);
    });
    document.body.append(article, accountSettings, aboutPSYS);
}
