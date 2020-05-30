import type { WebGen } from '@lucsoft/webgen';

export function renderHomeSettings(view: HTMLElement, web: WebGen, back: () => void, update: (updates: any[]) => Promise<void>): (data: any) => void
{
    view.style.position = "absolute";
    view.style.position = "absolute";
    view.style.left = "0";
    view.style.right = "0";
    view.style.overflow = "hidden";
    view.style.padding = "3rem 1rem 1rem 1rem";
    view.style.transform = "translate(-100%, 0)";
    view.style.transition = "transform 800ms cubic-bezier(0.87, 0.79, 0.07, 1.06)";

    const { list, action, span } = web.elements.none().components;
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
    const password = document.createElement('input');
    applyStyle(password);
    password.type = "password";
    password.autocomplete = "off";
    password.placeholder = "Neues Password";
    password.readOnly = true;
    password.onfocus = () => password.readOnly = false;
    const renderList = () =>
    {
        return [ {
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
            left: 'Adresse',
            right: street
        },
        {
            left: 'Passwort',
            right: password
        },
        {
            left: street.value == "" ?
                span('Bitte ergänzen Sie Ihre Adresse\n\nGeben Sie nur ein Passwort ein wenn sie es ändern wollen') :
                span('Geben sie nur ein Passwort ein wenn sie es ändern wollen')
        }
        ];

    }
    const settings = list({ noHeigthLimit: true }, ...renderList());
    let user: any | undefined = undefined;
    const onrefresh = (data: any) =>
    {
        user = data;
        firstname.value = data.name[ 0 ];
        lastname.value = data.name[ 1 ];
        email.value = data.email;
        street.value = data.street === "Ändern" ? "" : data.street;
        action(settings, "value", renderList())
    };
    web.elements.custom(view).window({
        title: 'Accounteinstellung',
        maxWidth: '50rem',
        content: settings,
        buttons: [
            {
                color: 'red',
                text: 'Speichern',
                onclick: async () =>
                {
                    const updated = [
                        { old: user?.name[ 0 ], new: firstname.value, type: "firstname" },
                        { old: user?.name[ 1 ], new: lastname.value, type: "lastname" },
                        { old: user?.email, new: email.value, type: "email" },
                        { old: user?.street ?? "", new: street.value, type: "street" },
                        { old: "", new: password.value, type: "password" },

                    ].filter(x => x.old != x.new)
                    if (updated.length == 0)
                        web.elements.notify('Ihr Account ist bereits so abgespeichert')
                    else
                    {
                        await update(updated);
                        web.elements.notify('Ihr Account wurde geupdated')
                    }
                }
            },
            {
                color: 'normal',
                text: 'Zurück',
                onclick: () => back()
            }
        ]
    }).last.classList.add('noanimation')
    return onrefresh;
}