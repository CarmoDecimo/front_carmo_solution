/**
 * Configurações da API
 * Centraliza todas as URLs e configurações relacionadas à API
 */

// URL base da API obtida das variáveis de ambiente
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Endpoints da API
export const API_ENDPOINTS = {
  // Equipamentos
  equipamentos: `${API_BASE_URL}/api/equipamentos`,
  equipamentosAlertas: `${API_BASE_URL}/api/equipamentos/alertas`,
  
  // Centros de Custo
  centrosCusto: `${API_BASE_URL}/api/centros-custo`,
  
  // Abastecimentos
  abastecimentos: `${API_BASE_URL}/api/abastecimentos`,
  
  // Manutenções
  manutencoes: `${API_BASE_URL}/api/manutencoes`,
} as const;

/**
 * Função utilitária para construir URLs da API
 * @param endpoint - Endpoint da API (ex: '/equipamentos', '/centros-custo')
 * @param id - ID opcional para adicionar ao endpoint
 * @returns URL completa da API
 */
export const buildApiUrl = (endpoint: string, id?: string | number): string => {
  const baseUrl = endpoint.startsWith('/') ? `${API_BASE_URL}${endpoint}` : `${API_BASE_URL}/${endpoint}`;
  return id ? `${baseUrl}/${id}` : baseUrl;
};

/**
 * Headers padrão para requisições autenticadas
 */
export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};
