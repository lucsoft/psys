import type { WebGen } from '@lucsoft/webgen';

async function sha256(message: string)
{
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
    return hashHex;
}

export async function renderLogin(web: WebGen)
{
    web.elements.body().login({
        email: "Email",
        password: "Password",
        maxWidth: "40rem",
        button: "Anmelden",
        text: 'Beim Punktesystem anmelden',
        login: async (password, email) =>
        {
            const shapassword = await sha256(password.value);
            fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
                method: "POST",
                body: JSON.stringify({
                    type: "login",
                    email: email.value,
                    password: shapassword
                })
            }).then(async (rsp) =>
            {
                const login = await rsp.json();
                if (login.login)
                {
                    localStorage.psysPassword = shapassword;
                    localStorage.psysEmail = email.value;
                    location.href = location.href;
                }
                else
                {
                    web.elements.notify('Falsche Anmeldedaten.');
                }

            })
        }
    }).last.style.marginTop = "7rem";
}