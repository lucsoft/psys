import type { WebGen } from '@lucsoft/webgen';
const createAccount = (firstname: string, lastname: string, email: string, admin: boolean, street: string): Promise<{ action: "ok" }> =>
{
    return new Promise(async (done) =>
    {
        fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
            method: "POST",
            body: JSON.stringify({
                type: 'addUser',
                email: localStorage.psysEmail,
                password: localStorage.psysPassword,
                target: {
                    firstname,
                    lastname,
                    email,
                    admin,
                    street: street || "Ändern"
                }
            })
        }).then(async (rsp) =>
        {
            const response = await rsp.json();
            done(response);
        })
    })
};
export function renderCreateAccount(area: HTMLElement, web: WebGen)
{
    const { list, switch: switchE, span } = web.elements.none().components;

    const applyStyle = (element: HTMLElement) =>
    {
        element.style.margin = "0";
        element.style.fontSize = "1rem";
        element.style.padding = ".8rem 1rem";
    }
    const firstname = document.createElement('input');
    firstname.placeholder = "Essie"
    applyStyle(firstname);
    const lastname = document.createElement('input');
    lastname.placeholder = "Neal"
    applyStyle(lastname);
    const email = document.createElement('input');
    email.placeholder = "john@company.com"
    applyStyle(email);
    const street = document.createElement('input');
    street.placeholder = "Ethiopia Street"
    applyStyle(street);
    let isAdmin = false
    const admin = switchE({
        onClick: () => { isAdmin = !isAdmin; }
    });
    web.elements.custom(area).window({
        maxWidth: '50rem',
        title: 'Account erstellen',
        content: list({ noHeigthLimit: true },
            {
                left: 'Vorname*',
                right: firstname
            },
            {
                left: 'Nachname*',
                right: lastname
            },
            {
                left: 'Email*',
                right: email
            },
            {
                left: 'Straße',
                right: street
            },
            {
                left: 'Administrator',
                right: admin
            },
            {
                left: span('*Diese sind notwendig und sollten auch richtig sein!')
            }

        ),
        buttons: [
            {
                text: 'Hinzufügen',
                color: 'normal',
                onclick: async () =>
                {
                    if (firstname.value == ""
                        || lastname.value == ""
                        || email.value == ""
                        || !email.value.includes('@')
                        || !email.value.includes('.')
                        || email.value.includes('platzhalter')
                    )
                    {
                        web.elements.notify(`Bitte füllen sie alles aus`);
                        return;
                    }
                    web.elements.notify(`${firstname.value} ${lastname.value} wird hinzugefügt...`);
                    const response: any = await createAccount(firstname.value, lastname.value, email.value, isAdmin, street.value);
                    if (response.action == "ok")
                    {
                        web.elements.notify(`${firstname.value} ${lastname.value} würde hinzugefügt`);
                    } else if (response.code == "USER_EXISTS")
                    {
                        web.elements.notify(`${firstname.value} ${lastname.value} würde schon hinzugefügt`);
                    } else
                        web.elements.notify(response.code)


                }
            }
        ]
    })
}