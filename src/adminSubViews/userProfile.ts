import type { WebGen } from '@lucsoft/webgen';
import type { UserData } from '../types';
const timestamp = (raw: string) =>
{
    const month = [ "Januar", "Februar", "Marz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];
    if (raw.includes(' '))
    {
        const splitTime = raw.split(' ');
        const year = splitTime[ 0 ].split('-').reverse().map(x => Number(x)).map((x, i) => i == 1 ? month[ x - 1 ] : x);

        return `${Number(year[ 0 ])}. ${year[ 1 ]} ${year[ 2 ]} ${splitTime[ 1 ]} Uhr`;
    } else
    {
        const splitTime = raw.split('.')
        return `${Number(splitTime[ 0 ])}. ${month[ Number(splitTime[ 1 ]) - 1 ]} ${splitTime[ 2 ]}`;
    }
};
const formatPointsEntry = (type: string, rawTimestamp: string, web: WebGen): HTMLElement =>
{
    const { span } = web.elements.none().components;

    const div = document.createElement('div');
    div.style.display = "inline-block";
    div.style.marginBottom = "-2.4rem";
    div.style.transform = "translate(0, -.4rem)";
    const main = span(type);
    main.style.display = "block";
    main.style.fontSize = "1.2rem";
    const date = span(`Vom ${timestamp(rawTimestamp)}`)
    date.style.fontSize = "0.8rem";
    div.append(main, date)
    return div;
}
function getDateTimestampFull()
{
    const datee = new Date();
    return `${(datee.getDate() < 9 ? "0" : '')}${datee.getDate()}.${((datee.getMonth() + 1) < 9 ? "0" : '')}${datee.getMonth() + 1}.${datee.getFullYear()}`;
}
const removeAccount = (id: string) =>
{
    return new Promise(async (done) =>
    {
        fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
            method: "POST",
            body: JSON.stringify({
                type: 'removeUser',
                email: localStorage.psysEmail,
                password: localStorage.psysPassword,
                target: id
            })
        }).then(async (rsp) =>
        {
            const response = await rsp.json();
            done(response);
        })
    })
};
const resetAccount = (id: string) =>
{
    return new Promise(async (done) =>
    {
        fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
            method: "POST",
            body: JSON.stringify({
                type: 'resetLogin',
                email: localStorage.psysEmail,
                password: localStorage.psysPassword,
                target: id
            })
        }).then(async (rsp) =>
        {
            const response = await rsp.json();
            done(response);
        })
    })
};
export async function renderUserProfile(data: UserData, area: HTMLElement, web: WebGen)
{
    const { APIUpdateAccount } = await import('../fetch/updateAccount');

    const types: string[] = JSON.parse(localStorage.psysTypes);

    const { list, span, switch: Switch, dropdown, multiStateSwitch, action, input } = web.elements.none().components;
    const leftList = document.createElement('span');
    const customType = input({ placeholder: "Eigener Type", width: "6rem" });
    customType.style.display = "none";
    customType.onkeyup = () => internalType = customType.value;
    let internalType = "0";
    const dropDown = dropdown({ small: true, default: 0 }, ...types.map((x, i) => ({
        title: x, action: () =>
        {
            internalType = i.toString();
            customType.style.display = "none";
        }
    })), {
        title: "Sonstiges",
        action: () => customType.style.display = "unset"
    })

    leftList.append(dropDown, customType)
    const actionList = document.createElement('div');
    actionList.style.display = "inline-block";
    const date = input({ value: getDateTimestampFull(), width: "5rem" });
    const count = input({ value: "1", type: "number", width: "5rem" });
    count.style.marginRight = "0rem";
    let enabled = true;
    const createEntry = async (change = Number(count.value)) =>
    {
        if (date.value.length != 10 || date.value.split('.').length != 3 || Number.isNaN(Number(date.value.split(".").join(""))))
        {
            web.elements.notify('Keine Gültige angabe');
            return;
        }
        if (!enabled)
            return;
        enabled = false;
        button.style.opacity = "0.3";
        const response: any = await APIUpdateAccount(data.id, [ {
            type: "history",
            new: [ ...data.history, { change, typeId: internalType, from: date.value, id: new Date().getTime() } ]
        } ]);
        data = response.user;
        action(pointhistory, "value", renderTable())
        enabled = true;
        button.style.opacity = "1";
    }
    const button = multiStateSwitch("small", {
        title: "+1", action: () => createEntry(1)
    }, {
        title: "+3", action: () => createEntry(3)
    }, {
        title: "Hinzufügen", action: () => createEntry()
    });
    button.style.display = "inline-flex";
    actionList.append(count, date, button);

    const renderTable = () => [ ...data.history.map((x) =>
    {
        const type = JSON.parse(localStorage.psysTypes)[ x.typeId ];
        return ({
            left: formatPointsEntry(!Number.isNaN(Number(x.typeId)) ? type : x.typeId, x.from, web),
            right: span(x.change > 0 ? `+ ${x.change.toLocaleString()}` : `- ${x.change.toLocaleString()}`),
            actions: [
                {
                    type: "delete",
                    click: async () =>
                    {
                        if (!enabled)
                            return;
                        enabled = false;
                        const response: any = await APIUpdateAccount(data.id, [ {
                            type: "history",
                            new: data.history.filter((w) => w.id != x.id)
                        } ]);
                        data = response.user;
                        action(pointhistory, "value", renderTable())
                        enabled = true;
                    }
                }
            ]
        })
    }),
    {
        left: leftList,
        right: actionList
    } ]
    const pointhistory = list({}, ...renderTable())

    const isInvalid = () => data.email.includes('platzhalter');
    let email: HTMLInputElement;
    if (isInvalid())
    {
        const applyStyle = (element: HTMLElement) =>
        {
            element.style.margin = "0";
            element.style.fontSize = "1rem";
            element.style.width = "19rem";
            element.style.padding = "0.7rem .8rem";
            element.style.border = "2px solid #ff0000bf";
        }
        email = document.createElement('input');
        email.placeholder = "john.doe@drk-furtwangen.de"
        email.autofocus = true;
        applyStyle(email);
    }
    else
    {
        email = span(data.email) as HTMLInputElement;
    }
    let editMode = false;
    const renderUserDetails = () =>
    {
        if (editMode)
        {
            const NameList = document.createElement('span');

            const firstname = input({ width: "5rem", value: data.name[ 0 ] })
            firstname.style.marginRight = "0";
            const lastname = input({ width: "5rem", value: data.name[ 1 ] })
            lastname.style.marginRight = "0";
            NameList.append(firstname, lastname);
            let isAdmin = data.isAdmin;
            const admin = Switch({ disabled: false, checked: data.isAdmin, onClick: () => isAdmin = !isAdmin })

            const email = input({ width: "10rem", value: data.email })
            email.style.marginRight = "0";
            const street = input({ width: "10rem", value: data.street });
            street.style.marginRight = "0";
            const save = multiStateSwitch('small', {
                title: 'Änderungen speichern', action: async () =>
                {

                    const { APIUpdateAccount } = await import('../fetch/updateAccount');
                    await APIUpdateAccount(data.id, [
                        {
                            old: data.name[ 0 ],
                            new: firstname.value,
                            type: "firstname"
                        }, {
                            old: data.name[ 1 ],
                            new: lastname.value,
                            type: "lastname"
                        },
                        {
                            old: data.isAdmin,
                            new: isAdmin,
                            type: "admin"
                        },
                        {
                            old: data.street,
                            new: street.value || 'Ändern',
                            type: "street"
                        },
                        {
                            old: data.email,
                            new: email.value,
                            type: "email"
                        }
                    ].filter(x => x.old != x.new));
                    data.email = email.value;
                    data.name[ 0 ] = firstname.value;
                    data.name[ 1 ] = lastname.value;
                    data.street = street.value;
                    data.isAdmin = isAdmin;
                    action(admin, 'checked', isAdmin);
                    editMode = false;
                    action(userDetails, 'value', renderUserDetails())
                }
            });
            return [ {
                left: 'Name',
                right: NameList
            },
            {
                left: 'Administrator',
                right: admin
            },
            {
                left: 'Email',
                right: email
            },
            {
                left: 'Erstellungsdatum',
                right: span(timestamp(data.create))
            },
            {
                left: 'Punktestand',
                right: span(data.currentpoints.toString() + " Punkte")
            },
            {
                left: 'Straße',
                right: street
            },
            {
                left: span(''),
                right: save
            }
            ];
        }
        else
            return [ {
                left: 'Name',
                right: span(data.name.join(' '))
            },
            {
                left: 'Administrator',
                right: Switch({ disabled: true, checked: data.isAdmin })
            },
            {
                left: 'Email',
                right: email
            },
            {
                left: 'Erstellungsdatum',
                right: span(timestamp(data.create))
            },
            {
                left: 'Punktestand',
                right: span(data.currentpoints.toString() + " Punkte")
            },
            {
                left: 'Straße',
                right: span(data.street || 'Unbekannt')
            } ];
    };
    const userDetails = list({ noHeigthLimit: true }, ...renderUserDetails());
    let check = false;
    web.elements.custom(area).window({

        maxWidth: "50rem",
        title: data.name.join(' '),
        content: userDetails,
        buttons: isInvalid() ? [
            {
                text: "Speichern",
                color: "red",
                onclick: async () =>
                {
                    console.log(data.email, 'test');
                    const { APIUpdateAccount } = await import('../fetch/updateAccount');
                    await APIUpdateAccount(data.id, [ {
                        new: email.value,
                        type: "email"
                    } ])
                    web.elements.notify('Email wurde geändert!')
                    area.innerHTML = "";
                }
            }
        ] : [
                {
                    text: "Bearbeiten",
                    color: 'red',
                    onclick: async () => { editMode = true; action(userDetails, 'value', renderUserDetails()) }
                },
                {
                    text: "Passwort zurücksetzten",
                    color: 'red',
                    onclick: async () =>
                    {
                        web.elements.notify('Neues Passwort wird generiert...')
                        await resetAccount(data.id);
                        web.elements.notify('Neues Passwort gesetzt.');
                        area.innerHTML = "";
                    }
                },
                {
                    text: "Löschen",
                    color: 'red',
                    onclick: async () =>
                    {
                        if (!check)
                        {
                            web.elements.notify('Sicher? Klicke erneut um zu bestätigen');
                            check = true;
                            return;
                        }
                        check = false;

                        web.elements.notify('Account wird gelöscht...');
                        await removeAccount(data.id);
                        web.elements.notify('Account wurde gelöscht.');
                        area.innerHTML = "";
                    }
                }
            ]
    })
    if (!isInvalid())
        web.elements.custom(area).window({
            maxWidth: '50rem',
            title: 'Punkteverlauf',
            content: pointhistory
        });
    if (isInvalid())
        document.querySelector("#fixedWindow")?.scrollTo?.(0, document.body.scrollHeight);
}
