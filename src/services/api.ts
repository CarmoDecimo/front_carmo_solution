// Configuração base da API
const API_BASE_URL = 'http://localhost:3001';

// Classe customizada para erros da API
export class ApiException extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiException';
    this.status = status;
    this.data = data;
  }
}

// Configuração padrão para as requisições
const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

// Função para obter o token de autenticação
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Função para criar headers com autenticação
const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...defaultHeaders };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Função genérica para fazer requisições HTTP
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Verifica se a resposta não é ok
    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: ${response.statusText}`;
      let errorData = null;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Se não conseguir fazer parse do JSON, usa a mensagem padrão
      }
      
      throw new ApiException(errorMessage, response.status, errorData);
    }

    // Tenta fazer parse da resposta JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      return await response.json();
    }
    
    // Se não for JSON, retorna como texto
    return (await response.text()) as unknown as T;
    
  } catch (error) {
    // Se for um erro de rede ou outro erro não relacionado à resposta HTTP
    if (error instanceof ApiException) {
      throw error;
    }
    
    throw new ApiException(
      'Erro de conexão com o servidor. Verifique sua conexão com a internet.',
      0,
      error
    );
  }
};

// Métodos HTTP específicos
export const api = {
  // GET - Buscar dados
  get: async <T>(endpoint: string): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'GET',
    });
  },

  // POST - Criar novos dados
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PUT - Atualizar dados completamente
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PATCH - Atualizar dados parcialmente
  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // DELETE - Remover dados
  delete: async <T>(endpoint: string): Promise<T> => {
    return makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  },

  // Método especial para upload de arquivos
  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Note: Não incluímos Content-Type para FormData, o browser define automaticamente
    return makeRequest<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  },
};

// Exporta a URL base para uso em outros lugares se necessário
export { API_BASE_URL };
