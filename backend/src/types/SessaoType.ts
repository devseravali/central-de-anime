export const  SessaoType = {
    id: 'number',
    usuarioId: 'number',
    refreshTokenHash: 'string',
    dispositivo: 'string?',
    ip: 'string?',
    userAgent: 'string?',
    expiraEm: 'Date',
    revogadoEm: 'Date?',
} as const;