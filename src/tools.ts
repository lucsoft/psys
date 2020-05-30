import type { WebGen } from '@lucsoft/webgen';

function formatTimestamp(raw: string): string
{
    const month = [ "Januar", "Februar", "Marz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];
    const splitTime = raw.split('.')
    return `${Number(splitTime[ 0 ])}. ${month[ Number(splitTime[ 1 ]) - 1 ]} ${splitTime[ 2 ]}`;
}
export const formatPointsEntry = (type: string, rawTimestamp: string, web: WebGen): HTMLElement =>
{
    const { span } = web.elements.none().components;

    const div = document.createElement('div');
    div.style.display = "inline-block";
    div.style.marginBottom = "-2.4rem";
    div.style.transform = "translate(0, -.4rem)";
    const main = span(type);
    main.style.display = "block";
    main.style.fontSize = "1.2rem";
    const date = span(`Vom ${formatTimestamp(rawTimestamp)}`)
    date.style.fontSize = "0.8rem";
    div.append(main, date)
    return div;
}