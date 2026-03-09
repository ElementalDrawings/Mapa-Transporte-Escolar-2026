# **Informe Técnico Exhaustivo: Arquitectura, Capacidades y Proyección de Google Antigravity (Estado al 28 de Enero de 2026\)**

## **1\. Introducción: El Cambio de Paradigma hacia el Desarrollo "Agent-First"**

A fecha de 28 de enero de 2026, el ecosistema de desarrollo de software atraviesa una de sus transformaciones más radicales desde la introducción de los entornos de desarrollo integrados (IDE) gráficos. El catalizador de este cambio ha sido la maduración y despliegue masivo de **Google Antigravity**, una plataforma lanzada en vista previa pública el 18 de noviembre de 2025, coincidiendo con la presentación de la familia de modelos Gemini 3\.1 Este informe técnico tiene como objetivo diseccionar minuciosamente el estado actual de la plataforma, trascendiendo la descripción superficial de características para analizar la arquitectura subyacente, las implicaciones de seguridad y la redefinición del rol del ingeniero de software que este sistema impone.

Históricamente, la evolución de las herramientas de codificación ha seguido una trayectoria de abstracción creciente. Desde los editores de texto planos hasta los IDEs con autocompletado determinista, y más recientemente, los asistentes de IA generativa como GitHub Copilot y Cursor. Sin embargo, estas herramientas anteriores operaban bajo un paradigma de "asistencia": el humano permanecía en el bucle de control principal, tecleando código y solicitando sugerencias puntuales. Antigravity rompe con esta tradición al establecer una arquitectura **"Agent-First"** (Agente Primero). En este modelo, el desarrollador transiciona de ser un mecanógrafo a un arquitecto u orquestador de una fuerza laboral digital autónoma.3

La nomenclatura "Antigravity" no es meramente comercial; alude a una filosofía de diseño destinada a neutralizar la "gravedad" técnica que ralentiza el desarrollo moderno: la configuración de entornos, la gestión de dependencias, el código repetitivo (boilerplate) y la fricción de cambiar contexto entre el editor, la terminal y el navegador.4 Al analizar el estado de la plataforma en el primer trimestre de 2026, observamos que esta promesa se materializa a través de una integración profunda de modelos de razonamiento de larga duración (Gemini 3 Pro) con capacidades de actuación local (ejecución de terminal, control de navegador) y una conectividad de datos estandarizada mediante el Protocolo de Contexto de Modelo (MCP).5

Este documento desglosa la plataforma en cuatro vectores críticos: su arquitectura dual y conectividad, sus funcionalidades avanzadas de configuración ("Skills" y "Rules"), la evidencia empírica de sus casos de uso, y una proyección de sus capacidades futuras. El análisis se basa en una revisión exhaustiva de la documentación técnica, repositorios de la comunidad y estudios de casos de implementación real observados hasta enero de 2026\.

## ---

**2\. Arquitectura y Conectividad: La Anatomía de una Plataforma Agentica**

La arquitectura de Google Antigravity se distingue por bifurcar la experiencia de desarrollo en dos superficies distintas pero sincronizadas: el **Agent Manager** (Gestor de Agentes) y el **Editor**. Esta separación de preocupaciones es deliberada y responde a la necesidad de gestionar flujos de trabajo asíncronos que son intrínsecos a la operación de agentes autónomos, en contraposición al flujo síncrono de la edición de texto tradicional.

### **2.1. La Interfaz de Superficie Dual**

#### **2.1.1. Agent Manager: El Centro de Control de Misión**

Al iniciar Antigravity, el usuario no se encuentra necesariamente con un árbol de archivos, sino con el **Agent Manager**. Esta interfaz actúa como un tablero de control de misión ("Mission Control"), diseñado para la orquestación de alto nivel.7 Aquí, la interacción no se basa en la manipulación directa de sintaxis, sino en la definición de objetivos y la supervisión de tareas.

El Agent Manager permite a los desarrolladores desplegar, monitorizar e interactuar con múltiples agentes que operan de manera asíncrona en diferentes espacios de trabajo (workspaces). Esta capacidad es fundamental para el paradigma agentico: un desarrollador puede asignar a un agente la tarea de "Refactorizar el módulo de autenticación para usar OAuth 2.0" y, mientras el agente planifica y ejecuta esa tarea que puede durar minutos u horas, el desarrollador puede centrarse en otra tarea de diseño o supervisar a un segundo agente.8

La interfaz visual del Agent Manager prioriza la visualización de **Artefactos** y estados de progreso sobre los registros (logs) crudos de la terminal. En lugar de ver un flujo interminable de comandos de sistema, el usuario ve tarjetas de estado que indican si el agente está en fase de "Planificación", "Ejecución" o "Verificación". Esta abstracción es clave para generar confianza sin saturar cognitivamente al operador humano.8

#### **2.1.2. El Editor: Ejecución Síncrona Potenciada por IA**

Cuando el desarrollador necesita intervenir directamente en el código ("dive in"), transiciona a la vista del **Editor**. Aunque basada en un fork altamente modificado de Visual Studio Code (existiendo debate en la comunidad sobre si deriva directamente de VS Code o de Windsurf, otro editor basado en IA) 1, esta superficie ha sido rediseñada para integrar la IA como un colaborador de primera clase.

Dentro del Editor, coexisten varias modalidades de interacción:

* **Agent Side Panel (Panel Lateral del Agente):** Es la interfaz principal para la colaboración síncrona. Aquí, el usuario mantiene un diálogo continuo con el agente activo, refinando prompts, revisando planes de implementación y proporcionando retroalimentación inmediata sobre los cambios propuestos.7  
* **Tab & Command:** Estas son las modalidades de "baja latencia". La función "Tab" ofrece un autocompletado predictivo avanzado, mientras que "Command" permite la refactorización localizada mediante instrucciones en lenguaje natural directamente en el lienzo del código (inline).9  
* **Panel de Subagente de Navegador:** Una innovación crítica es la inclusión de un panel dedicado donde un agente puede controlar una instancia de Chrome (visible o headless). Esto permite al agente realizar pruebas de extremo a extremo (E2E), verificar cambios visuales en la interfaz de usuario (UI) e interactuar con dashboards web, cerrando el ciclo de retroalimentación visual sin intervención humana.9

La sincronización entre el Agent Manager y el Editor es fluida. Una tarea iniciada en el Manager puede abrirse en el Editor para una revisión granular. Inversamente, una sesión de depuración compleja en el Editor puede "escalarse" al Manager, delegando la investigación continua a un agente en segundo plano para liberar al desarrollador.8

### **2.2. La Capa de Inteligencia: Modelos y Opcionalidad**

El núcleo cognitivo de Antigravity reside en la familia de modelos **Gemini 3**, específicamente optimizados para razonamiento y codificación. Sin embargo, la plataforma adopta una postura agnóstica y abierta respecto a los modelos, evitando el bloqueo del proveedor (vendor lock-in).

| Modelo | Especialización | Caso de Uso Principal |
| :---- | :---- | :---- |
| **Gemini 3 Pro** | Razonamiento complejo, ventana de contexto masiva (2M tokens), planificación de múltiples pasos. | Arquitectura, refactorización profunda, orquestación de agentes. 1 |
| **Gemini 3 Flash** | Baja latencia, alta velocidad de inferencia. | Autocompletado (Tab), ediciones rápidas (Command), tareas repetitivas. 1 |
| **Nano Banana** | Generación multimodal, diseño visual. | Creación de activos de frontend, generación de imágenes, interpretación de diseños UI. 12 |
| **Claude Sonnet 4.5** | Razonamiento matizado, codificación general. | Alternativa preferida por desarrolladores que valoran el estilo de codificación de Anthropic. 8 |
| **GPT-OSS** | Variantes de código abierto (Open Weights). | Entornos con requisitos estrictos de privacidad de datos o preferencia por modelos locales/abiertos. 1 |

Esta "opcionalidad de modelo" es estratégica. Permite a los equipos de ingeniería seleccionar el "cerebro" más adecuado para cada tarea. Por ejemplo, se puede utilizar Gemini 3 Pro para la planificación arquitectónica debido a su capacidad para mantener en contexto todo el repositorio, mientras que se delegan las tareas de generación de pruebas unitarias a un modelo más rápido y económico como Flash.7

### **2.3. Conectividad Profunda: El Protocolo de Contexto de Modelo (MCP)**

Uno de los avances arquitectónicos más significativos integrados en Antigravity es la adopción del **Model Context Protocol (MCP)**. Este estándar abierto actúa como un puente universal entre el IDE y los sistemas de registro de la empresa, resolviendo el problema histórico de la "alucinación por falta de contexto".5

#### **2.3.1. El Fin del "Copy-Paste" de Contexto**

En generaciones anteriores de herramientas de IA, el contexto se limitaba a los archivos abiertos en el editor. Si un agente necesitaba conocer el esquema de una base de datos de producción o el contenido de un ticket de Jira, el desarrollador debía copiar y pegar manualmente esa información. El MCP elimina esta fricción estableciendo una arquitectura cliente-anfitrión-servidor donde Antigravity (el cliente) se conecta a varios Servidores MCP.6

#### **2.3.2. Integraciones Nativas y de Ecosistema**

A fecha de enero de 2026, Antigravity incluye soporte nativo para servidores MCP que conectan con la infraestructura de **Google Cloud Data**. Los agentes pueden consultar de forma segura los esquemas y metadatos de **AlloyDB**, **BigQuery**, **Cloud SQL** y **Spanner**.6 Esto permite que un agente escriba consultas SQL sintácticamente perfectas y alineadas con el esquema real de producción, sin necesidad de que el desarrollador proporcione manualmente las definiciones de tabla (DDL).

Además, el ecosistema de terceros ha florecido, con servidores MCP disponibles para **Slack**, **GitHub**, **Linear**, **Sentry** y otras herramientas críticas.14 Un caso de uso potente habilitado por esto es la depuración autónoma: un agente puede leer un registro de error en Sentry, rastrear la pila de llamadas hasta el código fuente local, consultar el ticket de Linear asociado para entender los requisitos originales y proponer una corrección, todo ello sin salir del entorno de Antigravity.16

### **2.4. Ejecución Local y Actuación: El "Despegue"**

La metáfora de "Antigravity" sugiere escapar de la pesadez de las tareas manuales. Esto se logra mediante capacidades de ejecución local robustas. Los agentes en Antigravity no son meros generadores de texto; tienen capacidad de **actuación**.

* **Control de Terminal:** Los agentes pueden ejecutar comandos de shell. Esto les permite instalar dependencias (npm install, pip install), ejecutar suites de pruebas y gestionar el control de versiones (git commit, git push).17  
* **Manipulación del Sistema de Archivos:** Tienen autoridad para crear, editar, mover y eliminar archivos en todo el espacio de trabajo, respetando las reglas de .gitignore para evitar desastres en directorios de configuración o dependencias.18  
* **Navegación Web Activa:** El subagente de navegador puede navegar a localhost, interactuar con el DOM (hacer clic, escribir en formularios) y capturar capturas de pantalla para verificar visualmente que el código implementado cumple con los requisitos de diseño.9

## ---

**3\. Funcionalidades 'Ocultas', Trucos Pro y Gobernanza**

Más allá de la interfaz de chat evidente, Antigravity esconde una capa de configuración profunda que permite a los equipos de ingeniería "programar al programador". Estas funcionalidades —Skills, Rules, Workflows y Archivos de Contexto— son las que transforman la plataforma de un asistente genérico a un experto de dominio alineado con la cultura técnica de una organización.

### **3.1. El Sistema de Skills (Habilidades): Extensión Modular de Capacidades**

El sistema de **Skills** representa el mecanismo de extensibilidad más potente de la plataforma. A diferencia de los plugins tradicionales que requieren compilación, una Skill en Antigravity es un paquete de conocimiento y scripts ejecutables definidos en archivos legibles por humanos.19

#### **3.1.1. Anatomía de una Skill**

Una Skill reside en una carpeta que contiene un archivo SKILL.md y scripts opcionales.

* **Ubicación:** Pueden ser globales (\~/.gemini/antigravity/global\_skills/) para utilidades personales, o específicas del espacio de trabajo (\<workspace-root\>/.agent/skills/) para capacidades vinculadas a un proyecto.19  
* **Estructura de SKILL.md:** Este archivo combina metadatos YAML (nombre, descripción, disparadores) con instrucciones en Markdown. Define *cuándo* debe activarse la habilidad y *cómo* debe ejecutarse.  
* **Scripts Empaquetados:** Las Skills pueden incluir scripts en Python o Bash. Por ejemplo, una Skill de "Inspector de Base de Datos" podría incluir un script query\_runner.py que el agente ejecuta para obtener metadatos de tablas de forma segura (solo lectura).20

#### **3.1.2. Divulgación Progresiva y Ecosistema Comunitario**

El modelo utiliza un patrón de "divulgación progresiva" para gestionar su ventana de contexto. Inicialmente, el agente solo ve la lista de Skills disponibles. Solo cuando una solicitud del usuario coincide semánticamente con una Skill (ej. "Revisar vulnerabilidades de seguridad"), el agente carga el contenido completo de SKILL.md y activa la capacidad.19

La comunidad ha respondido rápidamente creando repositorios de Skills compartidas. El repositorio sickn33/antigravity-awesome-skills agrega cientos de habilidades para tareas como auditoría de seguridad (OWASP checks), optimización SEO, y andamiaje de frameworks específicos. Esto permite a los desarrolladores "descargar experiencia" en su IDE; un desarrollador frontend puede equipar a su agente con una "Skill de Ingeniero de Seguridad" para realizar una auditoría de penetración básica sobre su propia aplicación.21

### **3.2. Rules y Workflows: Gobernanza como Código**

Si las Skills otorgan *capacidad*, las **Rules** (Reglas) y **Workflows** (Flujos de Trabajo) otorgan *dirección* y *restricción*.

#### **3.2.1. Rules y el Archivo GEMINI.md**

Las reglas definen pautas de comportamiento que pueden estar siempre activas o activarse contextualmente.

* **GEMINI.md (La Constitución de la IA):** Ubicado en \~/.gemini/GEMINI.md o en la raíz del proyecto, este archivo actúa como el "Prompt de Arquitecto Experto". Define la personalidad base y las restricciones técnicas inquebrantables del agente. Por ejemplo: "Siempre utiliza TypeScript en modo estricto", "Prefiere la composición sobre la herencia", o "Nunca expongas secretos en los logs".7  
* **Reglas del Espacio de Trabajo:** En .agent/rules/, los equipos pueden codificar sus estándares de estilo (linter humano) y prácticas de seguridad específicas del proyecto.24

#### **3.2.2. Workflows: Automatización de Procesos**

Los Workflows definen secuencias de pasos para tareas complejas y repetitivas. A diferencia de un prompt simple, un Workflow orquesta una serie de acciones deterministas.

* **Ejemplo:** Un "Workflow de Release" podría definir los pasos exactos: 1\. Incrementar versión en package.json. 2\. Actualizar CHANGELOG.md. 3\. Ejecutar build. 4\. Crear etiqueta git. Al codificar esto, se asegura que el agente siga el protocolo oficial de la empresa sin desviaciones.7

### **3.3. Artefactos: Verificación y Confianza**

Para abordar el problema de la "caja negra" de la IA, Antigravity introduce los **Artefactos**. En lugar de un flujo de chat efímero, el agente genera objetos estructurados que sirven como puntos de control para la colaboración humano-máquina.8

* **Listas de Tareas (Task Lists):** Antes de escribir código, el agente propone un plan de alto nivel. El usuario puede editar, reordenar o vetar pasos antes de la ejecución.  
* **Planes de Implementación:** Especificaciones técnicas detalladas generadas antes de cambios complejos. Actúan como un "Design Doc" o RFC efímero.  
* **Walkthroughs (Recorridos):** Al finalizar una tarea, el agente genera un resumen visual de los cambios, incluyendo capturas de pantalla y "diffs" de código, facilitando una revisión rápida (Code Review) orientada a resultados.7

### **3.4. Seguridad Operativa: Secure Mode vs. Always Proceed**

La capacidad de un agente para ejecutar comandos de terminal introduce riesgos de seguridad significativos (ej. rm \-rf / o exfiltración de credenciales). Antigravity gestiona esto mediante modos de operación configurables.26

* **Secure Mode (Modo Seguro):** Es la configuración por defecto y la más restrictiva.  
  * **Terminal:** Requiere aprobación explícita del usuario para cada comando.  
  * **Navegador:** Bloquea la navegación a URLs externas a menos que estén en una lista blanca (Allowlist).  
  * **Archivos:** Enjaula al agente en la raíz del espacio de trabajo, respetando estrictamente .gitignore.18  
* **Always Proceed (Modo Turbo):** Preferido por usuarios avanzados ("Power Users") para sesiones de codificación autónoma ("vibe coding"). En este modo, el agente tiene permiso implícito para ejecutar comandos y editar archivos sin interrupción. Esto maximiza la velocidad pero requiere una confianza total en el modelo y en las salvaguardas del entorno (como la capacidad de "Deshacer" cambios masivos).27  
* **Listas de Permitidos/Denegados:** Existe una granularidad intermedia donde los usuarios pueden permitir comandos seguros (ls, npm test) mientras mantienen el bloqueo sobre comandos destructivos.28

## ---

**4\. Casos de Uso, Hitos y Evidencia de Impacto**

La eficacia de Antigravity se demuestra mejor a través de casos de uso reales que ilustran cómo la plataforma maneja la complejidad y acelera el desarrollo.

### **4.1. Caso de Estudio I: La Extensión C4X (El Agente como Arquitecto)**

Un ejemplo paradigmático del desarrollo "Agent-First" es la creación de la extensión C4X para VS Code. Este proyecto ilustra cómo un desarrollador actuó como "Gestor de Agente" (CEO) en lugar de codificador.23

* **Fase 0 \- Fundación:** El desarrollador invirtió horas iniciales no en escribir código, sino en redactar el archivo GEMINI.md. Este documento definió el DSL (Lenguaje Específico de Dominio) de C4X, las restricciones arquitectónicas y la estrategia de pruebas. Esencialmente, "programó al programador" antes de que se escribiera una sola línea de código funcional.23  
* **Ejecución:** El agente (Gemini 3\) construyó el andamiaje del proyecto, el motor de renderizado Markdown y el sistema de temas. El desarrollador se centró en revisar los "Planes de Implementación" y validar los Artefactos resultantes.  
* **Resultado:** Un proyecto complejo con más de 450 pruebas y un parser personalizado se completó en semanas en lugar de meses. El archivo GEMINI.md aseguró que el código generado fuera consistente y libre de "alucinaciones sintácticas", demostrando que la inversión en contexto de alta calidad paga dividendos exponenciales en la ejecución agentica.

### **4.2. Caso de Estudio II: Micro-SaaS en 15 Minutos (Vibe Coding)**

Para desarrolladores independientes ("Indie Hackers"), Antigravity ha habilitado el "Vibe Coding", un estilo de desarrollo centrado en la intención de alto nivel.29

* **Flujo de Trabajo:**  
  1. **Ideación:** El usuario define un producto, por ejemplo, "Un temporizador Pomodoro con gamificación" o "Un scraper de leads de Reddit".  
  2. **Prompt Divino ("God Prompt"):** Se introduce un prompt detallado especificando la pila tecnológica (Next.js, Supabase, Tailwind) y las funcionalidades clave.  
  3. **Andamiaje y Construcción:** El agente crea la estructura de directorios, instala dependencias y escribe el código base, resolviendo autónomamente problemas comunes como errores de CORS o fallos de hidratación en React.29  
  4. **Iteración Natural:** El usuario solicita cambios visuales o funcionales ("Añade un efecto de sonido al terminar") y el agente modifica el código y actualiza la UI en tiempo real.  
  5. **Despliegue:** El agente genera los artefactos necesarios para un despliegue en plataformas como Netlify o DigitalOcean, completando el ciclo de vida del software en minutos.30

### **4.3. Caso de Estudio III: Migración de Legado Empresarial**

En el entorno corporativo, el caso de uso dominante es la modernización de sistemas heredados.31

* **Escenario:** Migración de una base de código monolítica antigua (ej. Angularjs) a una arquitectura moderna (React/Next.js).  
* **Paralelismo Agentico:** Los informes sugieren una aceleración de 5x en estos procesos. La capacidad de ejecutar múltiples agentes permite una división del trabajo industrial: un Agente A traduce la lógica de negocio, un Agente B escribe las pruebas unitarias para el nuevo código, y un Agente C actualiza la documentación. Esta paralelización masiva convierte una migración de meses en una tarea de semanas, con una reducción significativa de errores humanos gracias a la consistencia de los patrones aplicados por los agentes.13

## ---

**5\. Proyección de Capacidades y Futuro del Desarrollo**

Mirando más allá de enero de 2026, la trayectoria de Google Antigravity apunta hacia una redefinición fundamental de la ingeniería de software.

### **5.1. La Mercantilización del "Boilerplate" y la Muerte de las Tareas Junior**

La "gravedad" del desarrollo —configuración, boilerplate, sintaxis básica— ha sido efectivamente resuelta. Esto implica que el costo marginal de iniciar un proyecto o probar una idea se acerca a cero. Sin embargo, esto también presiona el rol del desarrollador junior. Las tareas tradicionales de entrada (escribir pruebas simples, refactorización menor) son ahora dominio de los agentes. Los nuevos ingenieros deberán desarrollar habilidades de revisión y arquitectura ("Senior Junior Developers") mucho más temprano en sus carreras.4

### **5.2. El Agente como Orquestador de la Empresa**

Con la maduración del protocolo MCP, Antigravity se posiciona para convertirse en el sistema operativo de la empresa técnica. Los agentes no solo escribirán código, sino que interactuarán en tiempo real con datos de negocio, logs de servidores y métricas financieras. Esto permitirá la creación de aplicaciones "conscientes de los datos" (data-aware) con una velocidad sin precedentes, donde la lógica de negocio se conecta directamente a la infraestructura a través de la capa agentica.6

### **5.3. El Horizonte de Seguridad: El Problema del "Diputado Confundido"**

A medida que los agentes ganan autonomía, el riesgo de seguridad se desplaza hacia el problema del "Diputado Confundido" (Confused Deputy). Un agente con permisos amplios podría ser engañado (por ejemplo, mediante inyección de prompt indirecta en un archivo README malicioso) para realizar acciones destructivas. El futuro de Antigravity dependerá de la evolución de sus sistemas de "Sandboxing" y verificación formal, posiblemente moviéndose hacia entornos de ejecución efímeros y desechables para cada tarea agentica crítica.

## **6\. Conclusión**

Google Antigravity, en su estado actual a enero de 2026, representa mucho más que una evolución incremental del IDE. Es la primera implementación madura de una "Fábrica de Software Personal". Al combinar la potencia de razonamiento de Gemini 3 con la estructura operativa de Skills, Rules y MCP, Google ha creado una plataforma que permite a los desarrolladores trascender las limitaciones de su velocidad de escritura y capacidad de memoria de trabajo.

El éxito de la plataforma reside en su equilibrio entre autonomía y control: otorga a los agentes la libertad para ejecutar y planificar, pero proporciona a los humanos los Artefactos y mecanismos de gobernanza necesarios para confiar en el resultado. Si bien persisten desafíos en la granularidad de los permisos de seguridad y la curva de aprendizaje del nuevo paradigma de gestión, Antigravity ha establecido el estándar de facto para la era del desarrollo asistido por agentes.

### ---

**Apéndice: Referencia Técnica Rápida**

| Concepto | Descripción | Ámbito |
| :---- | :---- | :---- |
| **Agent Manager** | Dashboard de orquestación asíncrona. | Global / Multi-workspace |
| **MCP** | Protocolo para conectar IA con datos externos (BD, Herramientas). | Conectividad |
| **Skill** | Carpeta con SKILL.md y scripts para extender capacidades. | Workspace / Global |
| **Rule** | Restricción de comportamiento (ej. en GEMINI.md). | Gobernanza |
| **Artifact** | Objeto estructurado (Plan, Lista, Diff) generado por el agente. | Colaboración |
| **Secure Mode** | Entorno de ejecución restringido (requiere aprobación). | Seguridad |

**Fin del Informe.**

#### **Obras citadas**

1. fecha de acceso: enero 28, 2026, [https://en.wikipedia.org/wiki/Google\_Antigravity](https://en.wikipedia.org/wiki/Google_Antigravity)  
2. Introducing Google Antigravity, a New Era in AI-Assisted Software Development, fecha de acceso: enero 28, 2026, [https://antigravity.google/blog/introducing-google-antigravity](https://antigravity.google/blog/introducing-google-antigravity)  
3. Google Antigravity: The First True Agent-First IDE and the Future of Software Development | by James Fahey | Medium, fecha de acceso: enero 28, 2026, [https://medium.com/@fahey\_james/google-antigravity-the-first-true-agent-first-ide-and-the-future-of-software-development-e1a85d1e1d6c](https://medium.com/@fahey_james/google-antigravity-the-first-true-agent-first-ide-and-the-future-of-software-development-e1a85d1e1d6c)  
4. Google Antigravity: AI-First Development with This New IDE \- KDnuggets, fecha de acceso: enero 28, 2026, [https://www.kdnuggets.com/google-antigravity-ai-first-development-with-this-new-ide](https://www.kdnuggets.com/google-antigravity-ai-first-development-with-this-new-ide)  
5. Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/mcp](https://antigravity.google/docs/mcp)  
6. Connect Google Antigravity IDE to Google's Data Cloud services | Google Cloud Blog, fecha de acceso: enero 28, 2026, [https://cloud.google.com/blog/products/data-analytics/connect-google-antigravity-ide-to-googles-data-cloud-services](https://cloud.google.com/blog/products/data-analytics/connect-google-antigravity-ide-to-googles-data-cloud-services)  
7. Getting Started with Google Antigravity, fecha de acceso: enero 28, 2026, [https://codelabs.developers.google.com/getting-started-google-antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity)  
8. Build with Google Antigravity, our new agentic development platform ..., fecha de acceso: enero 28, 2026, [https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)  
9. Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/home](https://antigravity.google/docs/home)  
10. Google AI Antigravity IDE: The Revolutionary Dev Tool \- Enstacked, fecha de acceso: enero 28, 2026, [https://enstacked.com/google-ai-antigravity/](https://enstacked.com/google-ai-antigravity/)  
11. How to Set Up and Use Google Antigravity \- Codecademy, fecha de acceso: enero 28, 2026, [https://www.codecademy.com/article/how-to-set-up-and-use-google-antigravity](https://www.codecademy.com/article/how-to-set-up-and-use-google-antigravity)  
12. Google AntiGravity Agent Skills Just Changed EVERYTHING \- YouTube, fecha de acceso: enero 28, 2026, [https://www.youtube.com/watch?v=5BVjeEZOpzo](https://www.youtube.com/watch?v=5BVjeEZOpzo)  
13. Windsurf Pro vs Google Antigravity: The Ultimate AI IDE Comparison \- VERTU® Official Site, fecha de acceso: enero 28, 2026, [https://vertu.com/lifestyle/windsurf-pro-vs-google-antigravity-the-ultimate-ai-ide-comparison/](https://vertu.com/lifestyle/windsurf-pro-vs-google-antigravity-the-ultimate-ai-ide-comparison/)  
14. GitHub Introduces Agent HQ to Orchestrate 'Any Agent Any Way You Work', fecha de acceso: enero 28, 2026, [https://visualstudiomagazine.com/articles/2025/10/28/github-introduces-agent-hq-to-orchestrate-any-agent-any-way-you-work.aspx](https://visualstudiomagazine.com/articles/2025/10/28/github-introduces-agent-hq-to-orchestrate-any-agent-any-way-you-work.aspx)  
15. Activity Items Icon list' (Antigravity \- lacking Secondary Sidebar support in Lower OSS version) · Issue \#18301 · anthropics/claude-code \- GitHub, fecha de acceso: enero 28, 2026, [https://github.com/anthropics/claude-code/issues/18301](https://github.com/anthropics/claude-code/issues/18301)  
16. Review of Google Antigravity for Building Jira Apps \- Work Life by Atlassian, fecha de acceso: enero 28, 2026, [https://www.atlassian.com/blog/developer/review-of-google-antigravity-for-building-jira-apps](https://www.atlassian.com/blog/developer/review-of-google-antigravity-for-building-jira-apps)  
17. Google Antigravity Review: DeepMind's Agent-First Bet on Faster, Safer Software Development | Scalable Path, fecha de acceso: enero 28, 2026, [https://www.scalablepath.com/ai/google-antigravity-review](https://www.scalablepath.com/ai/google-antigravity-review)  
18. Google Antigravity just deleted the contents of my whole drive. : r/google\_antigravity \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/google\_antigravity/comments/1p82or6/google\_antigravity\_just\_deleted\_the\_contents\_of/](https://www.reddit.com/r/google_antigravity/comments/1p82or6/google_antigravity_just_deleted_the_contents_of/)  
19. Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/skills](https://antigravity.google/docs/skills)  
20. Authoring Google Antigravity Skills, fecha de acceso: enero 28, 2026, [https://codelabs.developers.google.com/getting-started-with-antigravity-skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills)  
21. I aggregated 58 skills for Antigravity into one repo : r/google\_antigravity \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/google\_antigravity/comments/1qcuc8u/i\_aggregated\_58\_skills\_for\_antigravity\_into\_one/](https://www.reddit.com/r/google_antigravity/comments/1qcuc8u/i_aggregated_58_skills_for_antigravity_into_one/)  
22. antigravity-awesome-skills/README.md at main \- GitHub, fecha de acceso: enero 28, 2026, [https://github.com/sickn33/antigravity-awesome-skills/blob/main/README.md](https://github.com/sickn33/antigravity-awesome-skills/blob/main/README.md)  
23. How I Built the C4X Antigravity IDE Extension with Google's Gemini ..., fecha de acceso: enero 28, 2026, [https://medium.com/google-cloud/how-i-built-the-c4x-antigravity-ide-extension-with-googles-gemini-3-6feb74f8a4b2](https://medium.com/google-cloud/how-i-built-the-c4x-antigravity-ide-extension-with-googles-gemini-3-6feb74f8a4b2)  
24. Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/rules-workflows](https://antigravity.google/docs/rules-workflows)  
25. What Is Google Antigravity? A Simple Guide to the New Gemini 3 AI Agent Coding Tool, fecha de acceso: enero 28, 2026, [https://www.glbgpt.com/hub/what-is-google-antigravity/](https://www.glbgpt.com/hub/what-is-google-antigravity/)  
26. Secure Mode \- Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/secure-mode](https://antigravity.google/docs/secure-mode)  
27. Agent Modes / Settings \- Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/agent-modes-settings](https://antigravity.google/docs/agent-modes-settings)  
28. \[Bug\] Antigravity still ask permission even command is already on allowed list, fecha de acceso: enero 28, 2026, [https://discuss.ai.google.dev/t/bug-antigravity-still-ask-permission-even-command-is-already-on-allowed-list/118636](https://discuss.ai.google.dev/t/bug-antigravity-still-ask-permission-even-command-is-already-on-allowed-list/118636)  
29. I Built a SaaS in 10 Minutes with Google Antigravity (No Code ..., fecha de acceso: enero 28, 2026, [https://www.youtube.com/watch?v=IAeSkRQvxsY](https://www.youtube.com/watch?v=IAeSkRQvxsY)  
30. Build a Full Stack AI SaaS for $0 (Antigravity \+ DigitalOcean) \- YouTube, fecha de acceso: enero 28, 2026, [https://www.youtube.com/watch?v=OeIaXFYf9ko](https://www.youtube.com/watch?v=OeIaXFYf9ko)  
31. Use Cases \- Google Antigravity \- AI IDE with Gemini 3 Pro | Agentic Software Development Platform, fecha de acceso: enero 28, 2026, [https://www.antigravityide.help/use-cases](https://www.antigravityide.help/use-cases)