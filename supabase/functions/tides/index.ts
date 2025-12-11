import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Portos de referência em Pernambuco para tábua de marés
const PORTS: Record<string, { name: string; lat: number; lon: number }> = {
  'recife': { name: 'Porto do Recife', lat: -8.0639, lon: -34.8711 },
  'suape': { name: 'Porto de Suape', lat: -8.3847, lon: -34.9486 },
  'tamandare': { name: 'Tamandaré', lat: -8.7594, lon: -35.1033 },
};

// Mapeamento de praias para portos de referência mais próximos
const BEACH_TO_PORT: Record<string, string> = {
  'boa-viagem': 'recife',
  'pina': 'recife',
  'brasilia-teimosa': 'recife',
  'piedade': 'recife',
  'candeias': 'recife',
  'maria-farinha': 'recife',
  'itamaraca': 'recife',
  'coroa-do-aviao': 'recife',
  'porto-de-galinhas': 'suape',
  'maracaipe': 'suape',
  'muro-alto': 'suape',
  'serrambi': 'suape',
  'calhetas': 'suape',
  'gaibu': 'suape',
  'paiva': 'suape',
  'suape': 'suape',
  'carneiros': 'tamandare',
  'tamandare': 'tamandare',
  'guadalupe': 'tamandare',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const beach = url.searchParams.get('beach');
    const port = url.searchParams.get('port');
    const date = url.searchParams.get('date'); // formato: YYYY-MM-DD

    // Determinar porto de referência
    let portKey: string | null = null;

    if (beach) {
      const beachSlug = beach.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/praia-de-/g, '')
        .replace(/praia-do-/g, '')
        .replace(/\s+/g, '-');
      
      portKey = BEACH_TO_PORT[beachSlug] || null;
      
      if (!portKey) {
        for (const [key, value] of Object.entries(BEACH_TO_PORT)) {
          if (beachSlug.includes(key) || key.includes(beachSlug)) {
            portKey = value;
            break;
          }
        }
      }
    } else if (port) {
      const portSlug = port.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
      
      portKey = PORTS[portSlug] ? portSlug : null;
    }

    // Se nenhum parâmetro, retorna informações disponíveis
    if (!portKey) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Use ?beach=boa-viagem ou ?port=recife para obter dados de marés',
        available_ports: Object.entries(PORTS).map(([slug, data]) => ({
          slug,
          name: data.name,
          coordinates: { lat: data.lat, lon: data.lon }
        })),
        beach_port_mapping: BEACH_TO_PORT,
        note: 'API de tábua de marés externa - dados calculados baseados em modelos'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const portData = PORTS[portKey];
    const targetDate = date || new Date().toISOString().split('T')[0];

    console.log(`Fetching tides for ${portData.name}, date: ${targetDate}`);

    // Tentar buscar da API tabuamare
    try {
      const tidesResponse = await fetch(
        `https://tabuamare.devtu.qzz.io/api/v1/tides?port=${encodeURIComponent(portData.name)}&date=${targetDate}`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (tidesResponse.ok) {
        const tidesData = await tidesResponse.json();
        return new Response(JSON.stringify({
          success: true,
          source: 'tabuamare',
          port: portData.name,
          port_coordinates: { lat: portData.lat, lon: portData.lon },
          date: targetDate,
          beach: beach || null,
          data: tidesData
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (apiError) {
      console.log('Tabuamare API not available, using calculated data');
    }

    // Fallback: calcular marés baseado em modelo simplificado
    // Marés em Recife são semidiurnas (2 marés altas e 2 baixas por dia)
    const calculatedTides = calculateTides(targetDate, portData);

    return new Response(JSON.stringify({
      success: true,
      source: 'calculated',
      port: portData.name,
      port_coordinates: { lat: portData.lat, lon: portData.lon },
      date: targetDate,
      beach: beach || null,
      tides: calculatedTides,
      disclaimer: 'Dados calculados por modelo simplificado. Para navegação, consulte a Marinha do Brasil.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error fetching tides data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao buscar dados de marés';
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface TideEvent {
  time: string;
  type: 'high' | 'low';
  height_m: number;
  description: string;
}

function calculateTides(dateStr: string, port: { name: string; lat: number; lon: number }): TideEvent[] {
  // Modelo simplificado de marés semidiurnas
  // Baseado em ciclo lunar aproximado de 12h25min entre marés
  
  const date = new Date(dateStr);
  const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
  
  // Fase lunar aproximada (ciclo de 29.5 dias)
  const lunarPhase = (dayOfYear % 29.5) / 29.5;
  
  // Amplitude varia com fase lunar (maiores em lua cheia/nova)
  const springTideFactor = Math.abs(Math.cos(lunarPhase * 2 * Math.PI));
  const baseAmplitude = 1.2; // metros
  const amplitude = baseAmplitude * (0.7 + 0.6 * springTideFactor);
  
  // Horários base (ajustados pelo dia do ano)
  const baseHour = (dayOfYear * 0.84) % 24; // Avanço de ~50min por dia
  
  const tides: TideEvent[] = [];
  
  // 4 marés por dia (2 altas, 2 baixas)
  for (let i = 0; i < 4; i++) {
    const hour = (baseHour + i * 6.2) % 24;
    const isHigh = i % 2 === 0;
    const height = isHigh 
      ? 1.5 + amplitude * (0.8 + 0.2 * Math.random())
      : 0.3 + (0.3 * Math.random());
    
    const hours = Math.floor(hour);
    const minutes = Math.floor((hour - hours) * 60);
    
    tides.push({
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      type: isHigh ? 'high' : 'low',
      height_m: Math.round(height * 10) / 10,
      description: isHigh 
        ? `Maré alta - ${height > 2 ? 'Maré de sizígia (lua cheia/nova)' : 'Maré normal'}`
        : `Maré baixa - ${height < 0.4 ? 'Boa para caminhada nos arrecifes' : 'Maré baixa normal'}`
    });
  }
  
  // Ordenar por horário
  tides.sort((a, b) => a.time.localeCompare(b.time));
  
  return tides;
}
