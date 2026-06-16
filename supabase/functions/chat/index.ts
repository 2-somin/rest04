import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `당신은 홈글리시(Homenglish) 사이트의 AI 도우미입니다.
홈글리시는 아이들을 위한 무료·유료 영어 교육 콘텐츠 플랫폼입니다.
사용자의 질문에 친절하고 간결하게 답변해주세요.
영어 학습 관련 질문에는 실용적인 조언을 제공하고, 사이트 이용 방법도 안내해드리세요.
한국어로 대화하되, 영어 예시는 영어로 보여주세요.`

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { messages } = await req.json()

    const solarApiKey = Deno.env.get('SOLAR_API_KEY')
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')

    const payload = {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      stream: false,
    }

    let apiUrl: string
    let apiKey: string
    let model: string

    if (solarApiKey) {
      apiUrl = 'https://api.upstage.ai/v1/chat/completions'
      apiKey = solarApiKey
      model = 'solar-mini'
    } else if (openaiApiKey) {
      apiUrl = 'https://api.openai.com/v1/chat/completions'
      apiKey = openaiApiKey
      model = 'gpt-4o-mini'
    } else {
      return new Response(
        JSON.stringify({ error: 'API 키가 설정되지 않았습니다.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, model }),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`API 오류 (${res.status}): ${errText}`)
    }

    const data = await res.json()
    const message = data.choices?.[0]?.message?.content ?? '응답을 받지 못했습니다.'

    return new Response(
      JSON.stringify({ message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : '알 수 없는 오류' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
