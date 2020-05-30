export const APIUpdateAccount = async (userid: string, updates: { new: any; type: string; }[]) =>
{
    return new Promise(async (done) =>
    {
        const target: any = {};

        target[ "id" ] = userid;
        for (const iterator of updates)
        {
            target[ iterator.type ] = iterator.new;
        }
        fetch('https://punktesystem.drk-furtwangen.de/assets/beta.php', {
            method: "POST",
            body: JSON.stringify({
                type: 'edit',
                email: localStorage.psysEmail,
                password: localStorage.psysPassword,
                target
            })
        }).then(async (rsp) =>
        {
            const response = await rsp.json();
            done(response);
        })
    })
}