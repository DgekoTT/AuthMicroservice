export interface UserInfo {
    email: string,
    id: number,
    roles: string[],
    displayName: string
}

export interface USerCreationAttrs {
    email: string;
    password: string;
    displayName: string;
    provider: string;
    verificationStatus?: boolean;
}