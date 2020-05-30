import { SupportedThemes, WebGen } from '@lucsoft/webgen';

const web = new WebGen();

if (localStorage.psysPassword !== undefined && localStorage.psysEmail !== undefined)
    import('./home')
        .then(({ renderHome }) =>
            renderHome(web, !!localStorage.psysIsAdmin ?? false));
else
    import('./login')
        .then(({ renderLogin }) =>
            renderLogin(web));
web.style.handleTheme(SupportedThemes.auto)
