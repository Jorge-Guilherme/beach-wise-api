import { useState } from "react";
import logo from "@/assets/logo-praias-pe.png";
import { Copy, Check, MapPin, Hotel, Utensils, Waves, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CodeBlock = ({ code, language = "bash" }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-foreground text-foam p-4 rounded-lg overflow-x-auto text-sm font-mono">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded bg-primary/20 hover:bg-primary/40 transition-colors"
      >
        {copied ? <Check className="w-4 h-4 text-secondary" /> : <Copy className="w-4 h-4 text-foam" />}
      </button>
    </div>
  );
};

const EndpointSection = ({ 
  method, 
  path, 
  description, 
  example,
  jsonResponse,
  params 
}: { 
  method: string; 
  path: string; 
  description: string;
  example: string;
  jsonResponse: string;
  params?: { name: string; type: string; description: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
            {method}
          </span>
          <code className="text-sm font-mono text-foreground">{path}</code>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0 space-y-4 animate-fade-in">
          <p className="text-muted-foreground">{description}</p>
          
          {params && params.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Parâmetros:</h4>
              <div className="space-y-1 bg-muted/30 p-3 rounded-lg">
                {params.map((param) => (
                  <div key={param.name} className="flex flex-wrap gap-2 text-sm">
                    <code className="text-primary font-mono">{param.name}</code>
                    <span className="text-muted-foreground">({param.type})</span>
                    <span className="text-muted-foreground">- {param.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-semibold mb-2">Exemplo de requisição:</h4>
            <CodeBlock code={example} />
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Exemplo de resposta JSON:</h4>
            <CodeBlock code={jsonResponse} language="json" />
          </div>
        </div>
      )}
    </div>
  );
};

const Index = () => {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  const stats = {
    praias: 20,
    hoteis: 24,
    restaurantes: 37
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section - Logo centralizada e estática */}
      <header className="bg-gradient-hero text-primary-foreground py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <img 
            src={logo} 
            alt="BeachWise API Logo" 
            className="w-28 h-28 md:w-36 md:h-36 rounded-2xl shadow-2xl mx-auto mb-8"
          />
          
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            BeachWise API
          </h1>
          
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
            API pública com informações completas sobre as praias de Pernambuco. 
            Acesse dados de <strong>praias</strong>, <strong>hotéis</strong>, <strong>restaurantes</strong>, 
            <strong> condições meteorológicas</strong> e <strong>tábua de marés</strong> em tempo real.
          </p>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="py-6 bg-sand-light border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: MapPin, title: "Praias", value: stats.praias },
              { icon: Hotel, title: "Hotéis", value: stats.hoteis },
              { icon: Utensils, title: "Restaurantes", value: stats.restaurantes },
              { icon: Waves, title: "Cidades", value: 10 },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="flex items-center justify-center gap-3 p-4 bg-card rounded-xl shadow-sm"
              >
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Como usar a API
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  Base URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`${baseUrl}/rest/v1`} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  Headers de autenticação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CodeBlock code={`apikey: ${apiKey}\nAuthorization: Bearer ${apiKey}`} />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Endpoints Tutorial */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">
            Endpoints Disponíveis
          </h2>

          <div className="max-w-4xl mx-auto space-y-4">
            {/* Praias */}
            <EndpointSection
              method="GET"
              path="/rest/v1/praias"
              description="Lista todas as praias de Pernambuco com informações detalhadas."
              example={`curl "${baseUrl}/rest/v1/praias?select=*" \\
  -H "apikey: ${apiKey}"`}
              jsonResponse={`[
  {
    "id": "4125048f-3855-4429-9ff9-d517880ba687",
    "nome": "Praia de Boa Viagem",
    "municipio": "Recife",
    "descricao": "A praia mais famosa de Recife...",
    "latitude": -8.1189,
    "longitude": -34.8947,
    "caracteristicas": ["arrecifes", "piscinas naturais", "urbana"],
    "infraestrutura": ["quiosques", "banheiros", "estacionamento"],
    "nivel_agitacao": "moderada",
    "ideal_para": ["banho", "caminhada", "esportes"]
  }
]`}
              params={[
                { name: "municipio", type: "string", description: "Filtra por município (eq.Recife)" },
                { name: "nivel_agitacao", type: "string", description: "Filtra por nível (eq.calma)" },
              ]}
            />

            {/* Hotéis */}
            <EndpointSection
              method="GET"
              path="/rest/v1/hoteis"
              description="Lista hotéis próximos às praias com comodidades e categorias."
              example={`curl "${baseUrl}/rest/v1/hoteis?select=*,praias(nome)" \\
  -H "apikey: ${apiKey}"`}
              jsonResponse={`[
  {
    "id": "uuid",
    "nome": "Atlante Plaza",
    "praia_id": "4125048f-...",
    "endereco": "Av. Boa Viagem, 5426",
    "telefone": "(81) 3302-3333",
    "categoria": 5,
    "comodidades": ["piscina", "spa", "restaurante", "wifi"],
    "praias": { "nome": "Praia de Boa Viagem" }
  }
]`}
              params={[
                { name: "praia_id", type: "uuid", description: "Filtra hotéis por praia" },
                { name: "categoria", type: "integer", description: "Filtra por categoria (1-5 estrelas)" },
              ]}
            />

            {/* Restaurantes */}
            <EndpointSection
              method="GET"
              path="/rest/v1/restaurantes"
              description="Lista bares, restaurantes e quiosques próximos às praias."
              example={`curl "${baseUrl}/rest/v1/restaurantes?tipo=eq.restaurante" \\
  -H "apikey: ${apiKey}"`}
              jsonResponse={`[
  {
    "id": "uuid",
    "nome": "Parraxaxá",
    "praia_id": "4125048f-...",
    "tipo": "restaurante",
    "endereco": "Av. Fernando Simões Barbosa, 1200",
    "telefone": "(81) 3463-7874",
    "horario_funcionamento": "11:30-15:30, 18:30-23:00",
    "especialidades": ["comida nordestina", "carne de sol"],
    "faixa_preco": "$$$"
  }
]`}
              params={[
                { name: "tipo", type: "string", description: "Tipo (bar, restaurante, quiosque)" },
                { name: "faixa_preco", type: "string", description: "Faixa de preço ($, $$, $$$, $$$$)" },
              ]}
            />

            {/* Weather */}
            <EndpointSection
              method="GET"
              path="/functions/v1/weather"
              description="Condições meteorológicas e de ondas para praias de Pernambuco."
              example={`curl "${baseUrl}/functions/v1/weather?beach=boa-viagem&days=1"`}
              jsonResponse={`{
  "success": true,
  "source": "cptec_ondas",
  "city": "Recife",
  "state": "PE",
  "waves": [
    {
      "date": "2024-12-11",
      "conditions": [
        {
          "time": "00Z",
          "wind_speed_kmh": 18,
          "wind_direction": "E",
          "wave_height_m": 1.2,
          "sea_state": "Fraco",
          "recommendation": "Excelente para banho"
        }
      ]
    }
  ]
}`}
              params={[
                { name: "beach", type: "string", description: "Nome da praia (ex: boa-viagem)" },
                { name: "city", type: "string", description: "Cidade (ex: recife, ipojuca)" },
                { name: "days", type: "number", description: "Dias de previsão (1-7)" },
              ]}
            />

            {/* Tides */}
            <EndpointSection
              method="GET"
              path="/functions/v1/tides"
              description="Tábua de marés com horários de maré alta e baixa."
              example={`curl "${baseUrl}/functions/v1/tides?beach=carneiros&date=2024-12-15"`}
              jsonResponse={`{
  "success": true,
  "port": "Tamandaré",
  "date": "2024-12-15",
  "beach": "carneiros",
  "tides": [
    {
      "time": "03:45",
      "type": "low",
      "height_m": 0.3,
      "description": "Maré baixa - Boa para caminhada nos arrecifes"
    },
    {
      "time": "09:52",
      "type": "high",
      "height_m": 2.1,
      "description": "Maré alta - Maré de sizígia"
    }
  ]
}`}
              params={[
                { name: "beach", type: "string", description: "Nome da praia" },
                { name: "port", type: "string", description: "Porto de referência (recife, suape, tamandare)" },
                { name: "date", type: "string", description: "Data (YYYY-MM-DD)" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-ocean text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src={logo} alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-xl">BeachWiseAPI</span>
          </div>
          <p className="text-sm opacity-80">
            Dados abertos sobre as praias de Pernambuco © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
