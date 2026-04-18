const { createClient } = require('@supabase/supabase-js');

const STUDENTS = [
  { name: 'Eunice', surname: 'Astondoa Novo', email: 'eastondoa@yahoo.es' },
  { name: 'Eulalia', surname: 'Blázquez García', email: 'lali80liss@hotmail.es' },
  { name: 'Ana María', surname: 'Cremades Jara', email: 'annmarie.cremadesjara@gmail.com' },
  { name: 'Andrés', surname: 'Curtis Martínez', email: 'andresccmm98@gmail.com' },
  { name: 'Lorena', surname: 'España Ortiz', email: 'lorenaespanaortiz@gmail.com' },
  { name: 'Ana María', surname: 'Espín García', email: 'anamaespin6@gmail.com' },
  { name: 'Javier', surname: 'Fernández Morcillo', email: 'javierfdez311@gmail.com' },
  { name: 'Carmen', surname: 'García Vera', email: 'carmengarciavera7@gmail.com' },
  { name: 'Lucía', surname: 'Gil Gallego', email: 'lucia.gilg18@gmail.com' },
  { name: 'Darío', surname: 'Guirao Martínez', email: 'dario.guiraomartinez@gmail.com' },
  { name: 'Sebastian', surname: 'Herrera Garcia', email: 'sebas071825@gmail.com' },
  { name: 'Ana', surname: 'Jimenez Ramirez', email: 'ajr25996@gmail.com' },
  { name: 'Rocío', surname: 'Jimenez Tovar', email: 'rociojimeneztovar@gmail.com' },
  { name: 'Rosemary Jane', surname: 'Kelly', email: 'rosemary.kelly@hotmail.com' },
  { name: 'Victoria', surname: 'Krok', email: 'victoriakrok@gmail.com' },
  { name: 'Cristina', surname: 'Lucas', email: 'cristina.lucasbrug@gmail.com' },
  { name: 'Nuria', surname: 'Marin Alvarez', email: 'nuriamarin99@hotmail.com' },
  { name: 'Carmen', surname: 'Marín Saura', email: 'carmen@cursosfustersaura.es' },
  { name: 'Maria Luisa', surname: 'Martín', email: 'mluisa@cursosfustersaura.es' },
  { name: 'Pablo', surname: 'Martínez Bernal', email: 'p.martiber2016@gmail.com' },
  { name: 'María', surname: 'Martínez López', email: 'mariamarlom2002@gmail.com' },
  { name: 'Esteban', surname: 'Montesinos', email: 'esteban@cursosfustersaura.es' },
  { name: 'Alba', surname: 'Montesinos Ferrándiz', email: 'amontesinosferrandiz@gmail.com' },
  { name: 'Steve', surname: 'Monty', email: 'esteban@estebanmontesinosfuster.com' },
  { name: 'Noemí', surname: 'Muñoz Medina', email: 'noemi.munoz2@murciaeduca.es' },
  { name: 'Pedro Manuel', surname: 'Pérez Peñalver', email: 'pedromanuelperezpenalver@gmail.com' },
  { name: 'Lucía', surname: 'Pujante Martínez', email: 'luciapujantemartinez27@gmail.com' },
  { name: 'Alfonso', surname: 'Ramos García', email: 'alf.ramosgarcia@gmail.com' },
  { name: 'Verónica', surname: 'Romero Martínez', email: 'veronicaromeromartinez@gmail.com' },
  { name: 'Sandra', surname: 'Ruiz Molina', email: 'sandra.ruizmol99@gmail.com' },
  { name: 'Natalia', surname: 'Vasyleha', email: 'nataliyavasyleha1979@gmail.com' },
  { name: 'Jack', surname: 'Vidal Morris', email: 'jackvidalmorris@gmail.com' },
  { name: 'Alejandro', surname: 'Zamora Lázaro', email: 'azlazaro4@gmail.com' },
];

const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers['authorization'] || '';
  if (!ADMIN_TOKEN || authHeader !== `Bearer ${ADMIN_TOKEN}`) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results = { created: [], failed: [] };

  for (const student of STUDENTS) {
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: student.email,
        password: 'Fustersaura2026',
        email_confirm: true,
      });

      if (authError) throw authError;

      const { error: dbError } = await supabase.from('students').insert({
        id: authData.user.id,
        name: student.name,
        surname: student.surname,
        email: student.email,
      });

      if (dbError) throw dbError;

      results.created.push(student.email);
    } catch (err) {
      results.failed.push({ email: student.email, error: err.message });
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(results),
  };
};
