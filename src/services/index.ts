// Exporta todos os serviços da API
export { api, ApiException, API_BASE_URL } from './api';
export { authService } from './authService';
export { abastecimentoService, centroCustoService } from './abastecimentoService';
export { oficinaService } from './oficinaService';
export { veiculosService, horimetroService } from './veiculosService';
export { userService } from './userService';
export { categoriaEquipamentoService } from './categoriaEquipamentoService';
export { equipamentosService } from './equipamentosService';

// Exporta todas as interfaces
export type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from './authService';

export type {
  User as UserManagement,
  CreateUserRequest,
  UpdateUserRequest,
  UsersResponse,
} from './userService';

export type {
  Abastecimento,
  CreateAbastecimentoRequest,
  UpdateAbastecimentoRequest,
  EquipamentoAbastecimento,
  CentroCusto,
} from './abastecimentoService';

export type {
  Manutencao,
  PecaUtilizada,
  CreateManutencaoRequest,
  InspecaoEquipamento,
  ItemInspecao,
} from './oficinaService';

export type {
  Veiculo,
  CreateVeiculoRequest,
  Horimetro,
  CreateHorimetroRequest,
} from './veiculosService';

export type {
  Categoria,
  CreateCategoriaRequest,
  UpdateCategoriaRequest,
} from './categoriaEquipamentoService';

export type {
  Equipamento,
  CreateEquipamentoRequest,
  UpdateEquipamentoRequest,
  UpdateHorimetroRequest,
  RegistrarManutencaoRequest,
  AssociarCentroCustoRequest,
  CategoriasResponse,
  EquipamentosResponse,
  EquipamentosFilters,
} from './equipamentosService';
