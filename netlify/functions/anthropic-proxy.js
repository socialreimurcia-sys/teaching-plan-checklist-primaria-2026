const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const studentId = event.headers['x-student-id'] || null;
    const section = event.headers['x-section'] || null;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    // Track token usage if we have a student ID and usage data
    if (studentId && data.usage && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      const tokensUsed = (data.usage.input_tokens || 0) + (data.usage.output_tokens || 0);
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_KEY,
          { auth: { autoRefreshToken: false, persistSession: false } }
        );

        await Promise.all([
          supabase.rpc('increment_tokens', { student_id: studentId, amount: tokensUsed }),
          supabase.from('token_logs').insert({
            student_id: studentId,
            tokens_used: tokensUsed,
            section: section,
          }),
        ]);
      } catch (trackErr) {
        console.error('Token tracking error:', trackErr.message);
      }
    }

    return {
      statusCode: response.status,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
