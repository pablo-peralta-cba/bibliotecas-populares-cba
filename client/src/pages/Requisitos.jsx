export default function Requisitos() {
  const requisitos = [
    'Establecerse por iniciativa de la comunidad en general, en localidades, zonas o barrios carentes de los servicios de una biblioteca popular próxima.',
    'Constituirse formalmente como asociación civil, con exclusividad para funcionar como BIBLIOTECA POPULAR y con Personería Jurídica como tal.',
    'Estar abierta en un horario no inferior a veinte horas semanales, con acceso y atención libre y gratuita a todo público, sin distinción alguna.',
    'Exponer en su fachada un cartel con la DENOMINACION de la Biblioteca, su carácter de BIBLIOTECA POPULAR y el HORARIO de atención al público.',
    'Contar entre los asociados con un número determinado de personas de la comunidad o barrio en el que funciona la biblioteca popular.',
    'Contar con una sala adecuada destinada al uso específico de la Biblioteca Popular, con acceso directo desde la calle.',
    'Poseer un fondo bibliográfico básico y heterogéneo, de amplia temática, para todas las edades.',
  ];

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="max-w-3xl mx-auto">
          <section>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
              REQUISITOS PARA SER UNA BIBLIOTECA POPULAR
            </h1>
            <p className="text-gray-700 leading-relaxed mb-6">
              <strong>
                Para que un proyecto de este tipo pueda convertirse en biblioteca popular
                reconocida por la CONABIP, deben cumplirse las siguientes condiciones:
              </strong>
            </p>
            <ul className="space-y-4">
              {requisitos.map((req, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 leading-relaxed">{req}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
