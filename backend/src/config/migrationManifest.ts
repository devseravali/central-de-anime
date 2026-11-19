// Canonical LF SHA-256 baseline; historical SQL must not be rewritten.
export const MIGRATION_MANIFEST: Readonly<Record<string, string>> = Object.freeze({
  '20260807200405': 'f76049f85f38bed6e7c1fb44e62f7e9730916b3c79a94f27719689478061d3a8',
  '20260807223002_add_personagem_fields': '96bbf47901a18fb925f2a52ee23aa8fb570b047d1d300f7f2b2d9721060548b4',
  '20260811221226_add_anime_genero_plataforma': 'deffef718c30372d25973189c8941981038a50ef0bacd252068ce6f1ac83fe97',
  '20260811225908_temporada_table': '6bddabecf9f67cd27ddd11c90bfd7f213b617a9e0a3e84cd005643679923653e',
  '20260819215330_add_password_reset_fields': 'f6db78b0154b5f6e3cad939b80cd403ff363071b928905ebb3bf2fe9d615b6ef',
  '20260821221836_add_cascade_sessao_usuario': '27b43dff1b746e755e35a80f3a60c94f555065a78dba9f0b3e59cbebd677a407',
  '20260825172514_add_unique_caminho_capas': 'feb833d52b86653ab2a5bca56e78de6357a240a076c8c69ab31477cfe8060009',
  '20260917225421_remove_episodio_unique': 'd7e4f928f4525728608aaa37aeb306ee4ce51929c9a67482c60fef861d7a9d21',
  '20260930210746_remove_temporada': 'a12e7ba400cae4cd5faf040af9b7f7de4a32754bc3552516fb7f059245596ea2',
  '20261014223959_add_email_verification_fields': '7f2de6cc4fa978c8e35ba38b7367d8ed43a7c7d305c67232e5cc58596f80f31f',
  '20261021222329_remove_ranking_usuario_legacy': '6af34589972d2661ba6af957a5528141418be25315f86f7abf0c3a252b942ae7',
  '20261021224218_add_personagem_nivel_combate': '2dcfaa9ad3fbda7fe18e3cd57edd8ba6feafdee889d9adadd47b90da77d2a8ae',
  '20261103220000_add_estacao_anime': '88aef3166236823d52ac5a131492ab61e048fe83ce89d831b87df42066e15bda',
});
