export const APITypesAdd = async (type: string): Promise<void> =>
{
    return new Promise(async (done) =>
    {
        fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
            method: "POST",
            body: JSON.stringify({
                type: 'addType',
                email: localStorage.psysEmail,
                password: localStorage.psysPassword,
                types: type
            })
        }).then(async () =>
        {
            await forceRefreshTypes();
            done();
        })
    })
}
const forceRefreshTypes = async () =>
{
    return new Promise(async (done) =>
    {
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
            }
            done();
        });
    })
};
export const APITypesRemove = async (type: string): Promise<void> =>
{
    return new Promise(async (done) =>
    {
        fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
            method: "POST",
            body: JSON.stringify({
                type: 'removeType',
                email: localStorage.psysEmail,
                password: localStorage.psysPassword,
                types: type
            })
        }).then(async () =>
        {
            await forceRefreshTypes();
            done();
        })
    })
}