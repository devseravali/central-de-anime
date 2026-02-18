export class ErroApi extends Error {
  constructor(
    public statusCode: number,
    public mensagem: string,
    public codigo?: string,
    public detalhes?: unknown,
  ) {
    super(mensagem);
    this.name = 'ErroApi';
    Object.setPrototypeOf(this, ErroApi.prototype);
  }

  static badRequest(mensagem: string, codigo: string = 'BAD_REQUEST'): ErroApi {
    return new ErroApi(400, mensagem, codigo);
  }

  static notFound(
    recurso: string = 'Recurso',
    codigo: string = 'NOT_FOUND',
  ): ErroApi {
    return new ErroApi(404, `${recurso} não encontrado`, codigo);
  }

  static conflict(mensagem: string, codigo: string = 'CONFLICT'): ErroApi {
    return new ErroApi(409, mensagem, codigo);
  }

  static unauthorized(codigo: string = 'UNAUTHORIZED'): ErroApi {
    return new ErroApi(401, 'Você precisa estar autenticado', codigo);
  }

  static forbidden(codigo: string = 'FORBIDDEN'): ErroApi {
    return new ErroApi(
      403,
      'Você não tem permissão para acessar este recurso',
      codigo,
    );
  }

  static internalServerError(
    mensagem: string = 'Erro interno do servidor',
    codigo: string = 'INTERNAL_ERROR',
  ): ErroApi {
    return new ErroApi(500, mensagem, codigo);
  }
}