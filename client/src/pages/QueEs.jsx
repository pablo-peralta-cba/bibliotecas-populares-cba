import { Link } from 'react-router-dom';

export default function QueEs() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="max-w-3xl mx-auto">
          <section className="mb-10">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
              ¿QUÉ ES UNA BIBLIOTECA POPULAR?
            </h1>
            <p className="text-gray-700 leading-relaxed mb-4">
              Una biblioteca popular es una asociación civil autónoma creada por la iniciativa
              de un grupo de vecinos de una comunidad. Ofrece servicios y espacios de consulta,
              expresión y desarrollo de actividades culturales, de la lectura y de extensión
              bibliotecaria en forma amplia, libre y pluralista.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Las bibliotecas populares son dirigidas y sostenidas principalmente por sus socios
              y brindan información, educación, recreación y animación socio-cultural, por medio
              de una colección bibliográfica y multimedial general y abierta al público.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
              ¿CÓMO CONSTITUIR UNA BIBLIOTECA POPULAR?
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En primera instancia, un grupo de vecinos autoconvocados deben reconocer en la
              localidad, barrio o comuna la necesidad y conveniencia de fundar y sostener una
              entidad de estas características. Para ello deberán realizarse visitas, encuentros,
              encuestas, hasta que la propia maduración del proyecto determine su firmeza.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              En esa etapa, pueden realizarse colectas y hasta acondicionar un local mínimo que
              permita brindar un ámbito propio a la biblioteca en formación. También es el momento
              para lograr acuerdos con otras instituciones oficiales y/o privadas que —sin
              intervenir en sus decisiones— puedan aportar alguna forma de ayuda al proyecto.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Una vez logrado este consenso y de continuar el entusiasmo y los objetivos iniciales
              se debe dar el siguiente paso fundamental: la Asamblea Constitutiva.
            </p>
          </section>

          <div className="mt-8 text-center">
            <Link
              to="/bibliotecas/requisitos"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver requisitos →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
