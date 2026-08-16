export default function Legislacion() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Legislación Bibliotecas Populares
      </h1>

      {/* Legislación Nacional */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Legislación a nivel nacional
        </h3>
        <ul className="space-y-4">
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">Ley 23.351 de Bibliotecas Populares</span>
            <a
              href="https://servicios.infoleg.gob.ar/infolegInternet/anexos/20000-24999/23024/norma.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ver el texto de la ley →
            </a>
          </li>
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">Reglamentación de la Ley Nº 23.351</span>
            <a
              href="https://www.saij.gob.ar/1078-nacional-decreto-nacional-ley-23351-bibliotecas-populares-dn19891001078-1989-07-06/123456789-0abc-870-1001-9891soterced"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ver el texto de la ley →
            </a>
          </li>
        </ul>
      </div>

      {/* Legislación Provincial */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Legislación a nivel provincial
        </h3>
        <ul>
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">
              Ley 8.016 Sistema Provincial de Bibliotecas Populares y Decreto Reglamentario
            </span>
            <a
              href="https://v.conabip.gob.ar/legislacion/detalle/5318"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ver el texto de la ley →
            </a>
          </li>
        </ul>
      </div>

      {/* Ordenanzas Municipales */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Ordenanzas municipales
        </h3>
        <ul className="space-y-4">
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">
              Córdoba Capital. Ordenanza Municipal Nº 9521 Comisión Municipal de Bibliotecas
              Públicas Populares
            </span>
            <a
              href="https://cultura.cordoba.gob.ar/wp-content/uploads/sites/21/2021/03/ord-no-9521-bibliotecas-publicas-populares.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ver el texto de la ley →
            </a>
          </li>
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">
              Río Cuarto. Ordenanza Municipal nº 1301/06 apoyo municipal a las Bibliotecas
              Populares
            </span>
            <a
              href="https://v.conabip.gob.ar/legislacion/detalle/5450"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ver el texto de la ley →
            </a>
          </li>
        </ul>
      </div>

      <hr className="border-gray-300 mb-8" />

      {/* Organismos */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Organismos
      </h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        <ul className="space-y-4">
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">
              CONABIP - Comisión Nacional de Bibliotecas Populares
            </span>
            <a
              href="https://v.conabip.gob.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ir al sitio oficial →
            </a>
          </li>
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">Agencia Córdoba Cultura</span>
            <a
              href="https://cultura.cba.gov.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ir al sitio oficial →
            </a>
          </li>
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">Asociación Bibliotecarios de Córdoba</span>
            <a
              href="https://abibcor.org.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ir al sitio web →
            </a>
          </li>
          <li className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="text-gray-700">
              IPJ. Dirección de Inspección de Personas Jurídicas de Córdoba
            </span>
            <a
              href="https://ipj.cba.gov.ar/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium mt-1 sm:mt-0"
            >
              Ir al sitio oficial →
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
