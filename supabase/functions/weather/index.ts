import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Códigos CPTEC para cidades litorâneas de Pernambuco
const CITY_CODES: Record<string, { code: number; name: string }> = {
  'recife': { code: 241, name: 'Recife' },
  'ipojuca': { code: 1299, name: 'Ipojuca' },
  'cabo-de-santo-agostinho': { code: 836, name: 'Cabo de Santo Agostinho' },
  'tamandare': { code: 1374, name: 'Tamandaré' },
  'jaboatao-dos-guararapes': { code: 1300, name: 'Jaboatão dos Guararapes' },
  'paulista': { code: 1356, name: 'Paulista' },
  'igarassu': { code: 1298, name: 'Igarassu' },
  'sirinhaem': { code: 1373, name: 'Sirinhaém' },
  'itamaraca': { code: 1301, name: 'Ilha de Itamaracá' },
};

// Mapeamento de praias para cidades
const BEACH_TO_CITY: Record<string, string> = {
  'praia-de-boa-viagem': 'recife',
  'praia-do-pina': 'recife',
  'praia-de-brasilia-teimosa': 'recife',
  'porto-de-galinhas': 'ipojuca',
  'praia-de-maracaipe': 'ipojuca',
  'praia-de-muro-alto': 'ipojuca',
  'praia-de-serrambi': 'ipojuca',
  'praia-dos-macacos': 'ipojuca',
  'praia-de-calhetas': 'cabo-de-santo-agostinho',
  'praia-de-gaibu': 'cabo-de-santo-agostinho',
  'praia-de-suape': 'cabo-de-santo-agostinho',
  'praia-do-paiva': 'cabo-de-santo-agostinho',
  'praia-de-carneiros': 'tamandare',
  'praia-de-tamandare': 'tamandare',
  'praia-de-piedade': 'jaboatao-dos-guararapes',
  'praia-de-candeias': 'jaboatao-dos-guararapes',
  'praia-de-maria-farinha': 'paulista',
  'coroa-do-aviao': 'igarassu',
  'praia-de-guadalupe': 'sirinhaem',
  'praia-de-itamaraca': 'itamaraca',
};

interface WeatherData {
  cidade: string;
  estado: string;
  atualizado_em: string;
  ondas: Array<{
    data: string;
    dados_ondas: Array<{
      vento: number;
      direcao_vento: string;
      direcao_vento_desc: string;
      altura_onda: number;
      direcao_onda: string;
      direcao_onda_desc: string;
      agitacao: string;
      hora: string;
    }>;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const city = url.searchParams.get('city');
    const beach = url.searchParams.get('beach');
    const days = url.searchParams.get('days') || '1';

    let cityKey: string | null = null;

    // Determinar a cidade baseado no parâmetro
    if (beach) {
      const beachSlug = beach.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
      cityKey = BEACH_TO_CITY[beachSlug] || null;
      
      if (!cityKey) {
        // Tenta encontrar correspondência parcial
        for (const [key, value] of Object.entries(BEACH_TO_CITY)) {
          if (key.includes(beachSlug) || beachSlug.includes(key.replace('praia-de-', ''))) {
            cityKey = value;
            break;
          }
        }
      }
    } else if (city) {
      const citySlug = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');
      cityKey = CITY_CODES[citySlug] ? citySlug : null;
      
      if (!cityKey) {
        // Tenta encontrar correspondência parcial
        for (const [key, value] of Object.entries(CITY_CODES)) {
          if (key.includes(citySlug) || value.name.toLowerCase().includes(citySlug)) {
            cityKey = key;
            break;
          }
        }
      }
    }

    // Se nenhum parâmetro específico, retorna lista de cidades disponíveis
    if (!cityKey) {
      const availableCities = Object.entries(CITY_CODES).map(([slug, data]) => ({
        slug,
        name: data.name,
        code: data.code
      }));

      const availableBeaches = Object.entries(BEACH_TO_CITY).map(([beachSlug, citySlug]) => ({
        beach: beachSlug,
        city: CITY_CODES[citySlug]?.name || citySlug
      }));

      return new Response(JSON.stringify({
        success: true,
        message: 'Use ?city=recife ou ?beach=boa-viagem para obter dados meteorológicos',
        available_cities: availableCities,
        available_beaches: availableBeaches
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cityData = CITY_CODES[cityKey];
    if (!cityData) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cidade não encontrada',
        available_cities: Object.keys(CITY_CODES)
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching weather for ${cityData.name} (code: ${cityData.code}), days: ${days}`);

    // Buscar dados de ondas da BrasilAPI
    const weatherResponse = await fetch(
      `https://brasilapi.com.br/api/cptec/v1/ondas/${cityData.code}/${days}`
    );

    if (!weatherResponse.ok) {
      console.error(`BrasilAPI error: ${weatherResponse.status}`);
      
      // Fallback: tentar buscar previsão do tempo geral
      const forecastResponse = await fetch(
        `https://brasilapi.com.br/api/cptec/v1/cidade/${cityData.code}`
      );
      
      if (forecastResponse.ok) {
        const forecastData = await forecastResponse.json();
        return new Response(JSON.stringify({
          success: true,
          source: 'cptec_forecast',
          city: cityData.name,
          city_code: cityData.code,
          data: forecastData,
          note: 'Dados de previsão geral (ondas não disponíveis)'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: false,
        error: 'Dados meteorológicos não disponíveis para esta cidade',
        city: cityData.name,
        city_code: cityData.code
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const weatherData: WeatherData = await weatherResponse.json();

    // Processar e enriquecer os dados
    const processedData = {
      success: true,
      source: 'cptec_ondas',
      city: weatherData.cidade || cityData.name,
      state: weatherData.estado || 'PE',
      city_code: cityData.code,
      updated_at: weatherData.atualizado_em,
      forecast_days: weatherData.ondas?.length || 0,
      waves: weatherData.ondas?.map(day => ({
        date: day.data,
        conditions: day.dados_ondas?.map(wave => ({
          time: wave.hora,
          wind_speed_kmh: wave.vento,
          wind_direction: wave.direcao_vento,
          wind_direction_description: wave.direcao_vento_desc,
          wave_height_m: wave.altura_onda,
          wave_direction: wave.direcao_onda,
          wave_direction_description: wave.direcao_onda_desc,
          sea_state: wave.agitacao,
          // Adiciona recomendação baseada nas condições
          recommendation: getRecommendation(wave.agitacao, wave.altura_onda, wave.vento)
        })) || []
      })) || [],
      beach_conditions: beach ? getBeachConditions(weatherData, beach) : null
    };

    return new Response(JSON.stringify(processedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error fetching weather data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados meteorológicos';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getRecommendation(seaState: string, waveHeight: number, windSpeed: number): string {
  const state = seaState?.toLowerCase() || '';
  
  if (state.includes('fraco') || (waveHeight < 0.5 && windSpeed < 15)) {
    return 'Excelente para banho e atividades aquáticas leves';
  } else if (state.includes('moderado') || (waveHeight < 1.5 && windSpeed < 25)) {
    return 'Bom para natação experiente e surfe intermediário';
  } else if (state.includes('forte') || waveHeight >= 1.5) {
    return 'Ideal para surfe avançado. Cuidado ao nadar';
  } else {
    return 'Verifique condições locais antes de entrar no mar';
  }
}

function getBeachConditions(weatherData: WeatherData, beachName: string): object {
  const today = weatherData.ondas?.[0];
  if (!today?.dados_ondas?.length) {
    return { status: 'Dados não disponíveis' };
  }

  // Pegar condição mais recente ou do meio do dia
  const midDayCondition = today.dados_ondas.find(c => c.hora === '12Z') || today.dados_ondas[0];
  
  return {
    beach: beachName,
    date: today.data,
    summary: {
      sea_state: midDayCondition.agitacao,
      wave_height: `${midDayCondition.altura_onda}m`,
      wind: `${midDayCondition.vento} km/h ${midDayCondition.direcao_vento_desc}`,
      recommendation: getRecommendation(midDayCondition.agitacao, midDayCondition.altura_onda, midDayCondition.vento)
    }
  };
}
