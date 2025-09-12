// Exporta todos os serviços da API
export { api, ApiException, API_BASE_URL } from './api';
export { authService } from './authService';
export { abastecimentoService } from './abastecimentoService';
export { oficinaService } from './oficinaService';
export { alertasService } from './alertasService';
export { veiculosService, horimetroService } from './veiculosService';

// Exporta todas as interfaces
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from './authService';

export type {
  Abastecimento,
  CreateAbastecimentoRequest,
  UpdateAbastecimentoRequest,
} from './abastecimentoService';

export type {
  Manutencao,
  PecaUtilizada,
  CreateManutencaoRequest,
  InspecaoEquipamento,
  ItemInspecao,
} from './oficinaService';

export type {
  Alerta,
  CreateAlertaRequest,
  AlertaSummary,
} from './alertasService';

export type {
  Veiculo,
  CreateVeiculoRequest,
  Horimetro,
  CreateHorimetroRequest,
} from './veiculosService';
