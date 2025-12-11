-- Tabela de praias de Pernambuco
CREATE TABLE public.praias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  municipio TEXT NOT NULL,
  descricao TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  caracteristicas TEXT[],
  infraestrutura TEXT[],
  nivel_agitacao TEXT CHECK (nivel_agitacao IN ('calma', 'moderada', 'agitada')),
  ideal_para TEXT[],
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de hotéis próximos às praias
CREATE TABLE public.hoteis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  praia_id UUID REFERENCES public.praias(id) ON DELETE SET NULL,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  website TEXT,
  categoria INTEGER CHECK (categoria >= 1 AND categoria <= 5),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  comodidades TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de bares e restaurantes
CREATE TABLE public.restaurantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  praia_id UUID REFERENCES public.praias(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  horario_funcionamento TEXT,
  especialidades TEXT[],
  faixa_preco TEXT CHECK (faixa_preco IN ('$', '$$', '$$$', '$$$$')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.praias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hoteis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurantes ENABLE ROW LEVEL SECURITY;

-- Políticas para leitura pública (API aberta)
CREATE POLICY "Praias são públicas para leitura" 
ON public.praias 
FOR SELECT 
USING (true);

CREATE POLICY "Hotéis são públicos para leitura" 
ON public.hoteis 
FOR SELECT 
USING (true);

CREATE POLICY "Restaurantes são públicos para leitura" 
ON public.restaurantes 
FOR SELECT 
USING (true);

-- Índices para performance
CREATE INDEX idx_praias_municipio ON public.praias(municipio);
CREATE INDEX idx_hoteis_praia ON public.hoteis(praia_id);
CREATE INDEX idx_restaurantes_praia ON public.restaurantes(praia_id);
CREATE INDEX idx_restaurantes_tipo ON public.restaurantes(tipo);