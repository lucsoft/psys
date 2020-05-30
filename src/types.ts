export interface UserDataHistory
{
    change: number, typeId: string, from: string, id: number
}

export interface UserData
{
    id: string;
    name: string[];
    email: string;
    isAdmin: boolean;
    currentpoints: number;
    create: string;
    street?: string;
    history: UserDataHistory[];
}