import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Server, 
  RefreshCw, 
  Users, 
  Globe, 
  Cookie, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  Layers, 
  Download, 
  Volume2, 
  CheckCircle,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

export default function PrivacidadPage() {
  const lastUpdated = '05 de agosto de 2026';

  const sections = [
    {
      id: '1-what-information-do-we-collect',
      icon: <FileText className="h-5 w-5 text-accent" />,
      title: '1. ¿Qué Información Recopilamos?',
      englishTitle: 'WHAT INFORMATION DO WE COLLECT?',
      content: (
        <>
          <p className="font-semibold text-ink mb-4">
            En Breve: Recopilamos información personal que tú nos proporcionas voluntariamente.
          </p>
          <p>
            Recopilamos la información que nos facilitas de manera activa al registrarte en nuestros Servicios, solicitar cotizaciones, enviarnos manuscritos o interactuar de cualquier otra manera con nosotros.
          </p>
          
          <h4 className="font-bold text-ink mt-6 mb-3 text-sm">Información personal que nos revelas:</h4>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Datos de Identificación y Contacto:</strong> Nombres, nombres de usuario, contraseñas, direcciones de correo electrónico, números de teléfono y datos de autenticación.</li>
            <li><strong>Información Financiera y de Facturación:</strong> Direcciones de facturación, números de tarjetas de débito/crédito (procesados de forma segura) y detalles de transacciones.</li>
            <li><strong>Archivos de la Obra y Producción:</strong> Manuscritos de libros (PDF, Word u otros formatos), archivos de proyecto, material audiovisual, grabaciones de voz y audio de clientes, locutores, narradores y talentos, notas de dirección y referencias técnicas.</li>
            <li><strong>Comunicaciones y Metadatos:</strong> Historial de mensajes, correos, registros de chat de soporte, comunicaciones en el portal y metadatos técnicos relacionados con tus archivos.</li>
          </ul>

          <h4 className="font-bold text-ink mt-6 mb-3 text-sm">Información Sensible:</h4>
          <p>
            Cuando es estrictamente necesario, y siempre bajo tu consentimiento o según lo permitido por la ley aplicable, procesamos datos financieros, información de facturación y detalles de transacciones a través de plataformas autorizadas como <strong>PayPal</strong> y transferencias bancarias internacionales (SWIFT).
          </p>

          <h4 className="font-bold text-ink mt-6 mb-3 text-sm">Datos de Pago:</h4>
          <p>
            Toda la información de pago es recopilada y procesada de manera externa y sumamente segura por nuestro procesador principal, <strong>PayPal</strong>. Puedes consultar su declaración de privacidad en el siguiente enlace:{' '}
            <a 
              href="https://www.paypal.com/es/legalhub/paypal/privacy-full?locale.x=es_ES%231" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-accent hover:underline break-all font-medium"
            >
              https://www.paypal.com/es/legalhub/paypal/privacy-full
            </a>.
          </p>

          <h4 className="font-bold text-ink mt-6 mb-3 text-sm">Información recopilada automáticamente:</h4>
          <p>
            Al navegar por nuestro sitio web, recopilamos automáticamente ciertos datos técnicos como tu dirección IP, características del navegador, sistema operativo, preferencias de idioma, URLs de referencia, nombre del dispositivo, país/ubicación general e historial de navegación. Esto se realiza mediante cookies y tecnologías similares con los siguientes fines:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Datos de Registro y Uso:</strong> Información de diagnóstico, rendimiento y logs recopilados por nuestros servidores.</li>
            <li><strong>Datos del Dispositivo:</strong> Detalles del computador, tablet o celular utilizado para acceder.</li>
            <li><strong>Datos de Ubicación:</strong> Ubicación general e imprecisa derivada de tu dirección IP.</li>
            <li><strong>Datos de Comportamiento y Navegación (Analytics):</strong> Páginas visitadas, clics, tiempo de permanencia, scroll y eventos de conversión.</li>
            <li><strong>Interacciones con Formularios:</strong> Datos de campos completados temporalmente y solicitudes de contacto.</li>
            <li><strong>Seguimiento de Campañas:</strong> Fuentes de tráfico y efectividad de anuncios publicitarios.</li>
          </ul>
        </>
      ),
    },
    {
      id: '2-how-do-we-process-your-information',
      icon: <Server className="h-5 w-5 text-accent" />,
      title: '2. ¿Cómo Procesamos tu Información?',
      englishTitle: 'HOW DO WE PROCESS YOUR INFORMATION?',
      content: (
        <>
          <p className="font-semibold text-ink mb-4">
            En Breve: Procesamos tu información para prestar, mejorar y administrar nuestros Servicios, comunicarnos contigo, prevenir fraudes, proteger la seguridad y cumplir con la ley.
          </p>
          <p>
            A continuación se detallan las finalidades específicas de nuestro procesamiento y sus correspondientes periodos de retención legal y comercial:
          </p>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-edge/50 bg-surface-elevated/50">
                  <th className="py-3 px-4 font-bold text-ink">Finalidad del Procesamiento</th>
                  <th className="py-3 px-4 font-bold text-ink">Descripción Corta</th>
                  <th className="py-3 px-4 font-bold text-ink">Periodo de Retención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/50">
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Creación y Autenticación de Cuentas</td>
                  <td className="py-3 px-4">Facilitar el acceso del usuario al Centro de Autor y mantener la cuenta en orden.</td>
                  <td className="py-3 px-4">Durante el contrato y hasta 3 años después del último contacto.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Prestación de Servicios de Producción</td>
                  <td className="py-3 px-4">Desarrollar la producción de audiolibros cinematográficos y gestionar las revisiones.</td>
                  <td className="py-3 px-4">Durante el contrato y hasta 3 años después de su finalización.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Soporte y Atención al Cliente</td>
                  <td className="py-3 px-4">Responder a consultas, cotizaciones técnicas y resolver inconvenientes.</td>
                  <td className="py-3 px-4">Hasta 3 años desde la última comunicación.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Comunicaciones Administrativas</td>
                  <td className="py-3 px-4">Enviar alertas de proyecto, actualizaciones del servicio y cambios de políticas.</td>
                  <td className="py-3 px-4">Durante la vigencia de la relación contractual.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Gestión de Pedidos, Facturación y SWIFT</td>
                  <td className="py-3 px-4">Procesar pagos de PayPal, registrar transferencias de proyectos y emitir facturas.</td>
                  <td className="py-3 px-4">Durante los periodos fiscales y de contabilidad exigidos por ley.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Solicitud de Comentarios (Feedback)</td>
                  <td className="py-3 px-4">Pedir reseñas y evaluar el nivel de satisfacción de autores y editoriales.</td>
                  <td className="py-3 px-4">Durante el contrato y hasta 1 año después de completar la obra.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Marketing y Comunicaciones Comerciales</td>
                  <td className="py-3 px-4">Enviar novedades y ofertas especiales si has aceptado recibirlas.</td>
                  <td className="py-3 px-4">Hasta que el usuario retire su consentimiento o se dé de baja.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Publicidad Dirigida y Medición</td>
                  <td className="py-3 px-4">Mostrar anuncios relevantes y analizar campañas de marketing.</td>
                  <td className="py-3 px-4">Hasta 3 años desde la última interacción o retiro del consentimiento.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Seguridad y Prevención de Fraude</td>
                  <td className="py-3 px-4">Monitorear accesos sospechosos y proteger la integridad del sitio.</td>
                  <td className="py-3 px-4">Tanto tiempo como sea necesario para registros de seguridad interna.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">Análisis de Tendencias y Usabilidad</td>
                  <td className="py-3 px-4">Analizar cómo navegan los usuarios para optimizar formularios y menús.</td>
                  <td className="py-3 px-4">El tiempo indispensable para estudios analíticos internos.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: '3-what-legal-bases-do-we-rely-on',
      icon: <Shield className="h-5 w-5 text-accent" />,
      title: '3. ¿En qué Bases Legales nos Apoyamos?',
      englishTitle: 'WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?',
      content: (
        <>
          <p className="font-semibold text-ink mb-4">
            En Breve: Solo procesamos tu información cuando es necesario y contamos con una base legal sólida según las leyes de protección de datos (como el GDPR en Europa, las leyes de Canadá, etc.).
          </p>
          <p>Nos apoyamos en las siguientes bases legítimas:</p>
          <ul className="list-disc pl-6 space-y-3 mt-4">
            <li><strong>Consentimiento:</strong> Procesamos tus datos si nos has dado autorización explícita para una finalidad concreta. Puedes retirar tu consentimiento en cualquier momento.</li>
            <li><strong>Ejecución de un Contrato:</strong> Cuando procesar tus datos es indispensable para cumplir con la producción, mezcla, masterización de tu obra o el soporte de acceso al Centro del Autor.</li>
            <li><strong>Obligación Legal:</strong> Para cumplir con normativas contables, fiscales, investigaciones de fraude o requerimientos de autoridades judiciales.</li>
            <li><strong>Intereses Legítimos:</strong> Para mejorar nuestros servicios, entender las tendencias de uso de Studio Flamkit, responder consultas administrativas y salvaguardar la seguridad de la plataforma.</li>
            <li><strong>Intereses Vitales:</strong> En casos extremos para proteger la seguridad física o integridad de cualquier persona.</li>
          </ul>
        </>
      ),
    },
    {
      id: '4-when-and-with-whom-do-we-share-your-personal-information',
      icon: <Users className="h-5 w-5 text-accent" />,
      title: '4. ¿Cuándo y con Quién Compartimos tu Información?',
      englishTitle: 'WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?',
      content: (
        <>
          <p className="font-semibold text-ink mb-4">
            En Breve: No comercializamos tus datos ni tus obras bajo ninguna circunstancia. Compartimos información solo en situaciones específicas con categorías de terceros de confianza.
          </p>
          <p>
            Para garantizar un correcto flujo de producción cinematográfica, colaboramos con proveedores tecnológicos y herramientas profesionales bajo estrictas cláusulas de confidencialidad:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li><strong>Herramientas de Análisis de Tráfico:</strong> Compartimos datos analíticos con <strong>Google Analytics</strong> (incluyendo Remarketing e informes de red de display), <strong>Meta Pixel</strong> y <strong>Microsoft Clarity</strong>.</li>
            <li><strong>Procesadores de Pago:</strong> PayPal y entidades bancarias de recepción de transferencias.</li>
            <li><strong>Servicios de Nube y Almacenamiento Seguro:</strong> Proveedores de bases de datos, almacenamiento de audio masterizado y hosting del sitio.</li>
            <li><strong>Canales de Comunicación y Colaboración:</strong> Email y WhatsApp para notificaciones técnicas de la producción.</li>
          </ul>
          <p className="mt-4">
            <em>Nota sobre los archivos de la obra:</em> Tu manuscrito, grabaciones de voz e instrucciones se comparten única y exclusivamente con el equipo de posproducción directo (editores, diseñadores de Foley, compositores) bajo estrictos acuerdos de no divulgación (NDA).
          </p>
        </>
      ),
    },
    {
      id: '5-do-we-use-cookies-and-other-tracking-technologies',
      icon: <Cookie className="h-5 w-5 text-accent" />,
      title: '5. ¿Utilizamos Cookies y Otras Tecnologías?',
      englishTitle: 'DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?',
      content: (
        <>
          <p>
            Sí, utilizamos cookies, píxeles y web beacons para recopilar información técnica sobre tu navegación. Esto nos permite recordar tus preferencias, asegurar el correcto funcionamiento del portal, corregir fallos técnicos y medir el desempeño de nuestras campañas en buscadores y redes sociales.
          </p>
          <p className="mt-4">
            <strong>Google Analytics:</strong> Utilizamos funciones publicitarias como Remarketing. Puedes inhabilitar de manera permanente el seguimiento de Google Analytics en la web mediante el complemento de exclusión oficial disponible en:{' '}
            <a 
              href="https://tools.google.com/dlpage/gaoptout" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-accent hover:underline font-medium"
            >
              tools.google.com/dlpage/gaoptout
            </a>.
          </p>
        </>
      ),
    },
    {
      id: '6-is-your-information-transferred-internationally',
      icon: <Globe className="h-5 w-5 text-accent" />,
      title: '6. ¿Se Transfiere tu Información Internacionalmente?',
      englishTitle: 'IS YOUR INFORMATION TRANSFERRED INTERNATIONALLY?',
      content: (
        <>
          <p>
            Nuestros servidores principales se encuentran alojados en los <strong>Estados Unidos</strong>. Sin embargo, debido a la infraestructura global de nuestros socios tecnológicos, tus datos personales y archivos pueden ser almacenados, procesados o transferidos hacia países como los <strong>Estados Unidos, Países Bajos, Alemania, Reino Unido</strong> y otros destinos.
          </p>
          <p className="mt-4">
            Para garantizar la seguridad en transferencias fuera del Espacio Económico Europeo (EEE), aplicamos las <strong>Cláusulas Contractuales Tipo (SCC)</strong> aprobadas por la Comisión Europea, exigiendo a todos nuestros proveedores los mismos niveles rigurosos de protección de datos personales y propiedad intelectual.
          </p>
        </>
      ),
    },
    {
      id: '7-how-long-do-we-keep-your-information',
      icon: <RefreshCw className="h-5 w-5 text-accent" />,
      title: '7. ¿Por Cuánto Tiempo Conservamos tu Información?',
      englishTitle: 'HOW LONG DO WE KEEP YOUR INFORMATION?',
      content: (
        <>
          <p>
            Conservamos tu información personal únicamente durante el tiempo estrictamente necesario para cumplir con los propósitos descritos en este aviso, a menos que la ley exija o permita plazos más extensos (por ejemplo, obligaciones contables y fiscales de hasta 10 años).
          </p>
          <p className="mt-4">
            Cuando no exista una necesidad comercial legítima de procesar tus datos, procederemos a eliminarlos de forma segura o anonimizarlos. Si se encuentran respaldados en archivos de copia de seguridad (backups), los aislaremos de cualquier procesamiento activo hasta que su eliminación total sea factible.
          </p>
        </>
      ),
    },
    {
      id: '8-how-do-we-keep-your-information-safe',
      icon: <Lock className="h-5 w-5 text-accent" />,
      title: '8. ¿Cómo Mantenemos tu Información Segura?',
      englishTitle: 'HOW DO WE KEEP YOUR INFORMATION SAFE?',
      content: (
        <>
          <p>
            Hemos implementado un robusto conjunto de medidas de seguridad técnicas y organizativas para salvaguardar tu información y, de manera primordial, tu propiedad intelectual (manuscritos, audios y voces).
          </p>
          <p className="mt-4">
            Toda transferencia de información en el sitio web y el Centro del Autor se encuentra cifrada bajo el protocolo estándar <strong>SSL/HTTPS</strong>. Almacenamos tus archivos de producción cinematográfica en sistemas en la nube líderes en seguridad, con controles de acceso restrictivos y autenticación de múltiples factores (MFA). 
          </p>
          <p className="mt-4">
            <em>Advertencia:</em> Aunque realizamos nuestros mayores esfuerzos para blindar tus datos, ninguna transmisión electrónica o almacenamiento en la red es 100% infranqueable, por lo que te exhortamos a acceder a nuestros Servicios siempre dentro de redes y entornos seguros.
          </p>
        </>
      ),
    },
    {
      id: '9-do-we-collect-information-from-minors',
      icon: <Users className="h-5 w-5 text-accent" />,
      title: '9. ¿Recopilamos Información de Menores?',
      englishTitle: 'DO WE COLLECT INFORMATION FROM MINORS?',
      content: (
        <>
          <p>
            No recopilamos conscientemente datos de menores de 18 años ni comercializamos con ellos. Al utilizar nuestros Servicios, declaras que tienes al menos 18 años de edad o que cuentas con la debida representación legal de un tutor que consiente el uso de los Servicios por parte del menor.
          </p>
          <p className="mt-4">
            Si detectamos la recopilación accidental de información de un menor de 18 años sin consentimiento legal verificable, procederemos de inmediato a desactivar la cuenta y purgar todos los registros asociados de nuestras bases de datos activas.
          </p>
        </>
      ),
    },
    {
      id: '10-what-are-your-privacy-rights',
      icon: <Shield className="h-5 w-5 text-accent" />,
      title: '10. ¿Cuáles son tus Derechos de Privacidad?',
      englishTitle: 'WHAT ARE YOUR PRIVACY RIGHTS?',
      content: (
        <>
          <p>
            Dependiendo de tu ubicación geográfica (como la Unión Europea, el Reino Unido, Canadá o ciertos estados de EE.UU.), posees derechos robustos sobre tu información personal.
          </p>
          <p className="mt-4">Estos derechos generales incluyen:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li><strong>Acceso y Copia:</strong> Solicitar confirmación de procesamiento y obtener un reporte detallado.</li>
            <li><strong>Rectificación:</strong> Corregir información incompleta o inexacta sobre ti.</li>
            <li><strong>Eliminación (Olvido):</strong> Solicitar que borremos tus datos de nuestros sistemas.</li>
            <li><strong>Portabilidad de Datos:</strong> Exportar tu información en un formato estructurado y de uso común.</li>
            <li><strong>Derecho a la No Discriminación:</strong> No sufrir penalizaciones por ejercer tus derechos.</li>
            <li><strong>Reclamaciones:</strong> Presentar quejas ante la autoridad reguladora competente (como la ICO en Reino Unido).</li>
          </ul>
          <p className="mt-4 font-semibold">Cómo retirar tu consentimiento:</p>
          <p>
            Si procesamos tus datos con base en tu consentimiento, puedes revocarlo en cualquier momento escribiendo a <a href="mailto:privacy@studioflamekit.com" className="text-accent hover:underline font-semibold">privacy@studioflamekit.com</a>. Ten en cuenta que esto no afectará la legalidad de los procesamientos realizados con anterioridad a la revocación.
          </p>
        </>
      ),
    },
    {
      id: '11-controls-for-do-not-track-features',
      icon: <Layers className="h-5 w-5 text-accent" />,
      title: '11. Controles para Funciones "No Rastrear" (DNT)',
      englishTitle: 'CONTROLS FOR DO-NOT-TRACK FEATURES',
      content: (
        <>
          <p>
            Muchos navegadores web y sistemas operativos móviles integran la señal Do-Not-Track (DNT) para expresar tu deseo de no ser monitoreado en línea. Actualmente, al no existir un estándar internacional uniforme y consensuado para interpretar estas señales, <strong>Studio Flamkit</strong> no responde de manera automatizada a señales DNT del navegador.
          </p>
        </>
      ),
    },
    {
      id: '12-do-united-states-residents-have-specific-privacy-rights',
      icon: <Layers className="h-5 w-5 text-accent" />,
      title: '12. Derechos de Privacidad para Residentes de EE.UU.',
      englishTitle: 'DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?',
      content: (
        <>
          <p>
            Si resides en estados con normativas específicas de privacidad (como California, Colorado, Texas, Virginia, entre otros), posees derechos especiales de acceso, exclusión de venta/intercambio para anuncios dirigidos y eliminación.
          </p>
          <h4 className="font-bold text-ink mt-6 mb-3 text-sm">Información Recopilada en los últimos 12 meses y su Retención:</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs mt-2">
              <thead>
                <tr className="border-b border-edge bg-surface-elevated/50">
                  <th className="py-3 px-4 font-bold text-ink">Categoría Termly</th>
                  <th className="py-3 px-4 font-bold text-ink">Ejemplos de Datos</th>
                  <th className="py-3 px-4 font-bold text-ink">¿Recopilado?</th>
                  <th className="py-3 px-4 font-bold text-ink">Criterio de Retención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge/50">
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">A. Identificadores</td>
                  <td className="py-3 px-4">Nombre real, alias, dirección, IP, correo, teléfono, cuenta.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Duración del contrato + requerimientos legales/fiscales.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">B. Registros de Cliente (CA)</td>
                  <td className="py-3 px-4">Nombre, contacto, firmas, información financiera.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Duración del contrato + requerimientos fiscales/contables.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">C. Clasificaciones Protegidas</td>
                  <td className="py-3 px-4">Edad, género, nacionalidad o datos demográficos.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Periodo contractual + soporte de la relación comercial.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">D. Información Comercial</td>
                  <td className="py-3 px-4">Transacciones de PayPal, cotizaciones, historial de compras.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Vigencia comercial + auditorías legales e impositivas.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">E. Biometría</td>
                  <td className="py-3 px-4">Huellas dactilares, reconocimiento facial.</td>
                  <td className="py-3 px-4 text-ink-muted/50">NO</td>
                  <td className="py-3 px-4">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">F. Actividad de Red</td>
                  <td className="py-3 px-4">Historial de navegación, búsquedas, clics, eventos Meta Pixel.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Análisis interno y hasta revocación de consentimiento.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">G. Geolocalización</td>
                  <td className="py-3 px-4">Ubicación aproximada del dispositivo según IP.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Análisis y seguridad interna durante relación activa.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">H. Información Sensorial</td>
                  <td className="py-3 px-4">Voces de narradores, audios originales, grabaciones de talento.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Vigencia contractual + entrega y resguardo del master.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">I. Información Laboral</td>
                  <td className="py-3 px-4">Currículum, historial laboral de narradores aplicantes.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Evaluación de talento + vigencia de su registro de voz.</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">J. Educación</td>
                  <td className="py-3 px-4">Expedientes académicos de estudiantes.</td>
                  <td className="py-3 px-4 text-ink-muted/50">NO</td>
                  <td className="py-3 px-4">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">K. Inferencias</td>
                  <td className="py-3 px-4">Perfiles de consumo o intereses creados de manera algorítmica.</td>
                  <td className="py-3 px-4 text-ink-muted/50">NO</td>
                  <td className="py-3 px-4">—</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-ink">L. Información Sensible (US)</td>
                  <td className="py-3 px-4">Contraseñas del Centro de Autor, correos, datos SWIFT.</td>
                  <td className="py-3 px-4 text-emerald-600 font-bold">SÍ</td>
                  <td className="py-3 px-4">Mientras mantengas tu cuenta de cliente habilitada.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      id: '13-project-materials-and-audio-files',
      icon: <Volume2 className="h-5 w-5 text-accent" />,
      title: '13. Materiales del Proyecto y Archivos de Audio',
      englishTitle: 'PROJECT MATERIALS AND AUDIO FILES',
      content: (
        <>
          <p>
            Recopilamos, almacenamos y procesamos de forma estrictamente privada y confidencial manuscritos, grabaciones iniciales, pistas de música, mezclas de Foley, solicitudes de revisión y archivos de audio finales proporcionados por el cliente.
          </p>
          <p className="mt-4">
            Esto se realiza con el único propósito de llevar a cabo la producción contratada y brindar soporte de re-descarga de tus másteres cinematográficos en el <strong>Centro del Autor</strong>.
          </p>
        </>
      ),
    },
    {
      id: '14-payments-and-billing',
      icon: <CreditCard className="h-5 w-5 text-accent" />,
      title: '14. Pagos y Facturación',
      englishTitle: 'PAYMENTS AND BILLING',
      content: (
        <>
          <p>
            Recopilamos información sobre tus pagos, datos fiscales, comprobantes de PayPal o códigos de transferencia bancaria internacional. Esta información se utiliza exclusivamente para emitir facturas, conciliar transacciones de producción y cumplir de forma rigurosa con las leyes impositivas internacionales.
          </p>
        </>
      ),
    },
    {
      id: '15-project-communications',
      icon: <Mail className="h-5 w-5 text-accent" />,
      title: '15. Comunicaciones de Proyecto',
      englishTitle: 'PROJECT COMMUNICATIONS',
      content: (
        <>
          <p>
            Podemos utilizar tus datos de contacto para enviarte actualizaciones periódicas sobre tu audiolibro cinematográfico, alertas de revisión, aprobaciones de guiones y entregas de capítulos a través de correo electrónico, <strong>WhatsApp</strong> o el canal de comunicación acordado técnicamente.
          </p>
        </>
      ),
    },
    {
      id: '16-account-and-client-access',
      icon: <Lock className="h-5 w-5 text-accent" />,
      title: '16. Acceso de Clientes y Cuentas',
      englishTitle: 'ACCOUNT AND CLIENT ACCESS',
      content: (
        <>
          <p>
            Las credenciales de acceso, contraseñas y registros de actividad del cliente se procesan con altos estándares de seguridad y cifrado para asegurar que solo tú, y las personas expresamente autorizadas por tu editorial, tengan acceso a tu portafolio privado en el portal de autores.
          </p>
        </>
      ),
    },
    {
      id: '17-portfolio-and-testimonials',
      icon: <CheckCircle className="h-5 w-5 text-accent" />,
      title: '17. Portafolio y Testimonios',
      englishTitle: 'PORTFOLIO AND TESTIMONIALS',
      content: (
        <>
          <p>
            Solo con tu autorización expresa o consentimiento por escrito, podremos utilizar el título de la obra, el arte de la portada, fragmentos mínimos de audio (demos cinematográficas) o tus testimonios para fines de portafolio, marketing institucional o campañas publicitarias de <strong>Studio Flamkit & Art</strong>.
          </p>
        </>
      ),
    },
    {
      id: '18-do-we-make-updates-to-this-notice',
      icon: <RefreshCw className="h-5 w-5 text-accent" />,
      title: '18. ¿Actualizamos este Aviso de Privacidad?',
      englishTitle: 'DO WE MAKE UPDATES TO THIS NOTICE?',
      content: (
        <>
          <p>
            Sí. Actualizaremos este documento según resulte necesario para mantenernos alineados con las leyes locales e internacionales de protección de datos. Cada actualización se marcará con la fecha de revisión correspondiente al inicio del documento. Si realizamos cambios sustanciales, te notificaremos publicando un aviso visible en nuestro portal o enviándote un correo electrónico directo.
          </p>
        </>
      ),
    },
    {
      id: '19-how-can-you-contact-us-about-this-notice',
      icon: <MapPin className="h-5 w-5 text-accent" />,
      title: '19. ¿Cómo Contactarnos sobre este Aviso?',
      englishTitle: 'HOW CAN YOU CONTACT US ABOUT THIS NOTICE?',
      content: (
        <>
          <p>
            Si tienes dudas, consultas sobre el tratamiento de tu propiedad intelectual o deseas contactarnos sobre esta política, puedes dirigir tu correspondencia por correo postal o de manera electrónica a las siguientes direcciones:
          </p>
          <div className="mt-6 rounded-2xl border-edge/50 bg-surface-elevated p-6 space-y-4 max-w-xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Correo Electrónico Directo</p>
              <p className="mt-1 font-semibold text-sm">
                <a href="mailto:privacy@studioflamekit.com" className="text-accent hover:underline">privacy@studioflamekit.com</a>
              </p>
              <p className="font-semibold text-sm mt-1">
                <a href="mailto:studioflamkit@gmail.com" className="text-accent hover:underline">studioflamkit@gmail.com</a>
              </p>
            </div>
            <div className="border-t border-edge/60 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-accent">Dirección Física Postal</p>
              <p className="mt-2 font-serif text-lg font-medium text-ink">Studio Flamkit & Art</p>
              <p className="text-sm text-ink-muted mt-1">Santo Domingo Este, 11015</p>
              <p className="text-sm text-ink-muted">Dominican Republic (República Dominicana)</p>
            </div>
          </div>
        </>
      ),
    },
    {
      id: '20-how-can-you-review-update-or-delete-the-data-we-collect',
      icon: <FileCheck className="h-5 w-5 text-accent" />,
      title: '20. ¿Cómo Revisar, Actualizar o Eliminar tus Datos?',
      englishTitle: 'HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?',
      content: (
        <>
          <p>
            En virtud de las leyes de tu país, provincia o estado de residencia, cuentas con el pleno derecho de solicitar el acceso a la información que recopilamos, corregir errores o solicitar el borrado permanente de tu información.
          </p>
          <p className="mt-4">
            Para ejercer estos derechos de protección de datos, por favor ingresa una solicitud formal enviando un correo electrónico detallado a:{' '}
            <a href="mailto:privacy@studioflamekit.com" className="text-accent font-semibold hover:underline">
              privacy@studioflamekit.com
            </a>. Responderemos a tu solicitud en un plazo máximo de 30 días, en total concordancia con las leyes vigentes.
          </p>
        </>
      ),
    },
  ];

  return (
    <main className="min-h-screen bg-surface text-ink">
      <Navbar />

      {/* Header section with refined display typography */}
      <section className="relative overflow-hidden border-b border-edge/50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,_var(--color-accent)_0%,_transparent_28%)] opacity-[0.10]" />
        <div className="relative mx-auto max-w-5xl px-6 py-20 text-center lg:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-accent">Studio Flamkit & Art</p>
          <h1 className="mt-4 font-serif text-4xl font-medium text-ink sm:text-5xl lg:text-6xl">
            Política de Privacidad
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-muted">
            Tu confianza y la seguridad de tu obra son fundamentales para nosotros. Descubre de qué manera protegemos tus datos, tus voces y tu propiedad intelectual en cada paso de nuestro proceso de producción cinematográfica.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs tracking-wider text-ink-muted/80 uppercase">
            <span>Última actualización: {lastUpdated}</span>
            <span className="hidden sm:inline">•</span>
            <span>Establecida vía Termly Compliance</span>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[300px_1fr]">
            
            {/* Sticky Navigation Index for Desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border-edge/50 bg-surface-elevated p-6 max-h-[75vh] overflow-y-auto custom-scroll">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-ink border-b border-edge/50 pb-3 mb-4">
                  Secciones de la Política
                </h3>
                <nav className="flex flex-col gap-2.5">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="text-xs text-ink-muted hover:text-accent transition duration-150 py-1 font-medium block border-l border-transparent hover:border-accent pl-3 -ml-px hover:translate-x-0.5 line-clamp-2"
                      title={section.title}
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Privacy Document Content */}
            <div className="space-y-10">
              {/* Top Warning card */}
              <div className="rounded-3xl border-amber-500/20 bg-amber-500/5 p-6 md:p-8 flex items-start gap-4">
                <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-ink-muted leading-6">
                  <p className="font-semibold text-ink">Cumplimiento Riguroso & Verificación</p>
                  <p className="mt-1">
                    Este documento refleja los términos de privacidad generados para <strong>Studio Flamkit & Art</strong> de acuerdo con los estándares internacionales. Para garantizar la máxima transparencia en nuestra plataforma, hemos indexado los 20 apartados obligatorios relacionados con la retención, procesamiento y los derechos de propiedad intelectual.
                  </p>
                </div>
              </div>

              {sections.map((section) => (
                <div
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 rounded-3xl border-edge/50 bg-surface-elevated p-8 md:p-10 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3 border-b border-edge/60 pb-4 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 shrink-0">
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-medium text-ink md:text-2xl">
                        {section.title}
                      </h2>
                      <p className="text-[10px] uppercase tracking-wider text-ink-muted/80 font-mono mt-0.5">
                        {section.englishTitle}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm leading-7 text-ink-muted space-y-4">
                    {section.content}
                  </div>
                </div>
              ))}

              {/* Termly Attribution and Final Actions */}
              <div className="rounded-3xl border-edge/50 bg-surface-elevated p-8 text-center space-y-6">
                <p className="text-xs text-ink-muted/80">
                  Esta Política de Privacidad fue generada y verificada mediante la tecnología de cumplimiento de <strong>Termly</strong> de conformidad con regulaciones vigentes de privacidad digital.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href={routes.home}>
                    <Button variant="secondary" className="px-6">
                      Volver al Inicio
                    </Button>
                  </Link>
                  <a href="mailto:privacy@studioflamekit.com">
                    <Button variant="primary" className="px-6">
                      Contactar Soporte de Privacidad
                    </Button>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
