export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role?: string | null;
    initials?: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};

export type NotifikasiCount = {
    belumDibaca: number;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
