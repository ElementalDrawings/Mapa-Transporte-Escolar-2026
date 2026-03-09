# **Arquitectura de Agentes y Protocolos de Extensibilidad en Google Antigravity: Informe Técnico de Ingeniería (Enero 2026\)**

## **1\. El Paradigma "Agent-First": Redefiniendo el Entorno de Desarrollo Integrado**

### **1.1. Contexto Histórico y Evolución Tecnológica (2024-2026)**

La industria del desarrollo de software se encuentra, a fecha de 28 de enero de 2026, en la culminación de una transición fundamental que comenzó a gestarse a mediados de la década. Si los años 2023 y 2024 se caractericaron por la adopción masiva de asistentes de codificación predictivos (tipo "copiloto") que operaban principalmente mediante autocompletado sintáctico y sugerencias en línea, el ciclo actual marca la consolidación de la era del "Desarrollo Agentico" (Agentic Development).1

Google Antigravity, la plataforma insignia de esta nueva generación, no se conceptualiza meramente como un editor de texto aumentado con Inteligencia Artificial, sino como una plataforma "Agent-First".3 En este nuevo paradigma arquitectónico, el Entorno de Desarrollo Integrado (IDE) evoluciona desde una herramienta pasiva de edición hacia un "Centro de Mando" (Mission Control).2 El rol del ingeniero de software humano experimenta una metamorfosis paralela: deja de ser el único generador de sintaxis para convertirse en un arquitecto de sistemas y orquestador de una fuerza laboral digital compuesta por agentes autónomos.3 Estos agentes, impulsados por modelos de razonamiento avanzado como Gemini 3 Pro o Claude Sonnet 4.5, poseen la capacidad no solo de escribir código, sino de planificar, ejecutar, validar e iterar tareas complejas de ingeniería con una autonomía supervisada.2

Esta transición responde a la necesidad de superar las limitaciones inherentes a los modelos de chat convencionales. Mientras que un LLM (Large Language Model) estándar en una interfaz de chat carece de contexto profundo sobre el proyecto y de capacidad de ejecución directa, la arquitectura de Antigravity integra el modelo cognitivo directamente con el sistema de archivos, la terminal y el navegador, permitiendo una interacción bidireccional con el entorno de desarrollo.1

### **1.2. El Fenómeno del "Vibe Coding" y la Brecha de Ingeniería**

Hacia 2026, ha surgido un movimiento cultural y técnico denominado "Vibe Coding".1 Este término describe un flujo de trabajo donde la barrera de entrada técnica se reduce drásticamente, permitiendo a los usuarios —desde desarrolladores expertos hasta hobbistas— construir aplicaciones funcionales describiendo sus intenciones en lenguaje natural, dejando que la IA maneje la implementación subyacente.7 Antigravity se posiciona como la herramienta más amigable para este enfoque, facilitando la transformación de prompts en productos.7

Sin embargo, para la ingeniería de software profesional y empresarial, el "Vibe Coding" presenta desafíos significativos en términos de determinismo, seguridad y estandarización. Una "vibra" o intención vaga ("mejora la seguridad de la base de datos") no es suficiente para garantizar el cumplimiento de protocolos estrictos de seguridad corporativa o estándares de codificación legados. Aquí reside la brecha crítica que la funcionalidad de "Skills" (Habilidades) viene a cerrar. Los Skills actúan como el mecanismo de formalización que transforma la intención generativa y probabilística del modelo en una ejecución técnica precisa, repetible y segura.1

### **1.3. La Necesidad Arquitectónica de los Skills: Eficiencia Cognitiva**

Los modelos fundacionales son generalistas por diseño. Un modelo como Gemini 3 Pro posee un vasto conocimiento sobre lenguajes de programación, pero carece de conocimiento específico sobre el contexto local de un proyecto, las convenciones de nomenclatura de un equipo específico o los scripts de despliegue propietarios de una organización.9

Históricamente, los ingenieros intentaban resolver esto mediante "System Prompts" masivos, cargando cientos de líneas de instrucciones en la ventana de contexto del modelo al inicio de cada sesión. Esta práctica conducía a dos problemas estructurales graves:

1. **Fatiga de Instrucciones (Instruction Fatigue):** El modelo, saturado con reglas irrelevantes para la tarea inmediata, comenzaba a degradar su rendimiento, ignorando directrices o alucinando comportamientos.1  
2. **Ineficiencia de Recursos:** Cargar instrucciones de despliegue cuando el usuario solo está editando estilos CSS desperdicia tokens, aumenta la latencia y el costo computacional.2

La arquitectura de Skills en Google Antigravity resuelve estos problemas mediante un patrón de diseño conocido como **Divulgación Progresiva** (Progressive Disclosure).2 Bajo este modelo, el conocimiento especializado se encapsula en módulos discretos (Skills) que permanecen "latentes" hasta que el agente determina semánticamente que son necesarios para la tarea en curso. Esto mantiene la ventana de contexto limpia ("pristine context") y optimiza la capacidad de razonamiento del agente para la tarea activa.1

## ---

**2\. Anatomía Técnica y Estándar de Implementación de Skills**

La implementación de Skills en Google Antigravity se adhiere a un estándar abierto basado en sistemas de archivos, diseñado para ser ligero, portable y legible tanto por humanos como por máquinas. A diferencia de los plugins compilados de los IDEs tradicionales, un Skill es fundamentalmente una estructura de directorios que contiene definiciones en Markdown y lógica en scripts.9

### **2.1. Estructura Canónica del Directorio**

Un Skill válido en Antigravity se define por su contención dentro de una carpeta y la presencia obligatoria de un archivo de definición SKILL.md. La estructura recomendada para un Skill de producción incluye componentes para la definición, ejecución y soporte 1:

| Componente | Ruta Relativa | Obligatoriedad | Descripción Técnica |
| :---- | :---- | :---- | :---- |
| **Definición** | ./SKILL.md | **Obligatorio** | El "cerebro" del skill. Contiene metadatos YAML e instrucciones en lenguaje natural. |
| **Lógica** | ./scripts/ | Opcional | Directorio para scripts ejecutables (Python, Bash, Node.js, Go) que realizan operaciones atómicas. |
| **Recursos** | ./resources/ | Opcional | Almacén de plantillas, archivos de configuración base o datos estáticos que el agente puede leer. |
| **Referencias** | ./references/ | Opcional | Documentación adicional o ejemplos extendidos para contextos complejos. |
| **Activos** | ./assets/ | Opcional | Imágenes o diagramas utilizados para input/output multimodal. |

Esta estructura modular permite la encapsulación completa de una capacidad. Por ejemplo, un skill de migración de base de datos (database-migration) puede contener el SKILL.md con las reglas de seguridad, los scripts Python en scripts/ para ejecutar las migraciones, y plantillas SQL en resources/ para crear nuevas tablas.1

### **2.2. Profundización en el Archivo SKILL.md**

El archivo SKILL.md es el núcleo de la ingeniería de prompt persistente. Su diseño se divide en dos secciones críticas: el Frontmatter YAML y el Cuerpo Markdown.

#### **2.2.1. El Frontmatter YAML: Metadatos y Activación**

La cabecera del archivo, delimitada por \---, contiene los metadatos que el sistema de orquestación de Antigravity indexa para el descubrimiento y activación de skills.

YAML

\---  
name: security-audit-expert  
description: Realiza auditorías de seguridad estática y modelado de amenazas en el código. Úselo cuando el usuario solicite revisar vulnerabilidades, analizar riesgos o validar el cumplimiento de estándares OWASP.  
author: sec-ops-team  
version: 1.2.0  
\---

**Análisis de Campos Críticos:**

* **name (Identificador):** Debe ser único dentro de su ámbito de ejecución. La convención estricta es usar *kebab-case* (minúsculas, guiones, sin espacios), limitándose a caracteres alfanuméricos y guiones. Se prohíbe el uso de etiquetas XML o palabras reservadas del sistema como "anthropic" o "claude" (dada la compatibilidad cruzada).11 Una longitud máxima de 64 caracteres es recomendada para asegurar la compatibilidad con visualizaciones de UI y logs.12  
* **description (Vector de Activación):** Este es el campo más crítico desde una perspectiva de ingeniería de IA. Actúa como el "Trigger Phrase" o disparador semántico. El router del agente convierte esta descripción en embeddings vectoriales para compararla con la intención del usuario.11  
  * *Ingeniería de Descripción:* Una descripción vaga como "Herramientas de seguridad" es ineficaz y provocará fallos en la activación. Una descripción robusta debe seguir el patrón: **Verbo de Acción \+ Objeto Directo \+ Contexto de Uso**. Ejemplo: "Ejecuta análisis estático SAST sobre archivos Python y Node.js para detectar inyecciones SQL. Activar cuando se mencionen 'vulnerabilidades' o 'auditoría'".12  
  * *Perspectiva:* Debe escribirse siempre en tercera persona (e.g., "Realiza...", "Ejecuta...") para alinearse con el prompt del sistema del agente. El uso de primera persona ("Yo hago...") confunde al modelo sobre la naturaleza de la herramienta.12

#### **2.2.2. El Cuerpo Markdown: Ingeniería de Instrucciones**

Debajo del YAML reside la lógica cognitiva del Skill. Esto no es código tradicional, sino instrucciones estructuradas que programan el comportamiento del LLM.

Secciones Estándar del Cuerpo 9:

1. **Goal (Objetivo):** Una declaración clara y concisa del resultado esperado. Define el "estado de éxito" de la operación.  
2. **Instructions (Instrucciones):** Una lista ordenada de pasos lógicos. Aquí se define el algoritmo cognitivo que el agente debe seguir. Es crucial utilizar verbos imperativos y ser explícito sobre el orden de operaciones.  
3. **Constraints (Restricciones):** Reglas negativas ("Do Not") que actúan como guardarraíles de seguridad. Ejemplo: "No ejecutes comandos DELETE sin confirmación explícita del usuario".11  
4. **Examples (Few-Shot Prompting):** Pares de entrada/salida que demuestran el comportamiento esperado. Esto utiliza la capacidad de aprendizaje *few-shot* de los modelos para calibrar el tono y el formato de la respuesta.13

Ejemplo Técnico de Cuerpo SKILL.md (Reconstrucción basada en 3):

# **Database Inspector**

## **Goal**

Consultar de forma segura la base de datos local PostgreSQL para proporcionar insights sobre el estado actual de los datos sin riesgo de modificación.

## **Instructions**

1. Analizar la solicitud del usuario para identificar la entidad de datos requerida (ej. usuarios, pedidos).  
2. Formular una consulta SQL sintácticamente correcta para PostgreSQL.  
3. **VALIDACIÓN CRÍTICA:** Verificar que la consulta comience estrictamente con SELECT. Rechazar cualquier otra operación.  
4. Ejecutar la consulta utilizando el script wrapper: python scripts/query\_runner.py "\<QUERY\>".  
5. Si el resultado contiene menos de 50 filas, presentarlo en una tabla Markdown. Si excede, presentar un resumen estadístico.

## **Constraints**

* **NUNCA** generar ni ejecutar sentencias INSERT, UPDATE, DELETE o DROP.  
* **NUNCA** mostrar contraseñas, hashes de seguridad o claves API en la salida, incluso si la base de datos las devuelve.  
* Si el script de ejecución falla, reportar el error exacto devuelto por stderr sin intentar inventar datos.

## **Examples**

**User:** "¿Cuántos usuarios nuevos se registraron ayer?"

**Agent:** Ejecutando análisis...

python scripts/query\_runner.py "SELECT count(\*) FROM users WHERE created\_at \>= NOW() \- INTERVAL '1 day'"

**Result:** Se registraron 145 usuarios nuevos.

### **2.3. Integración de Scripts y el Patrón "Black Box"**

Una de las capacidades más potentes de Antigravity es la ejecución de código arbitrario a través de Skills. Esto permite al agente salir del dominio del texto y efectuar cambios en el sistema.1

El patrón de "Caja Negra" (Black Box) implica encapsular la complejidad de la ejecución en scripts dedicados dentro de la carpeta scripts/. En lugar de pedirle al agente que escriba un script de Python complejo en tiempo real (lo cual es propenso a errores de sintaxis o alucinaciones de librerías), el Skill proporciona un script pre-probado y robusto.

* **Agnosticismo de Lenguaje:** Antigravity puede ejecutar cualquier script para el cual el entorno host tenga un intérprete (Python, Node, Bash, Go compilado).1  
* **Mapeo de Argumentos:** El SKILL.md debe instruir explícitamente al agente sobre cómo construir la línea de comandos. "Usa el script scripts/deploy.py. Pasa el nombre del entorno como el flag \--env".1  
* **Aislamiento de Dependencias:** Un desafío ingenieril importante es la gestión de dependencias. Si un script Python requiere pandas, el entorno del usuario debe tenerlo instalado. Skills avanzados incluyen un paso de verificación (pip install \-r requirements.txt) o utilizan entornos virtuales autoxontenidos para asegurar la portabilidad.

## ---

**3\. Jerarquía de Carpetas y Gestión de Alcance (Scoping)**

La arquitectura de Antigravity implementa un sistema de resolución de Skills basado en la ubicación del archivo, definiendo dos alcances principales: Workspace (Local) y Global. Entender esta jerarquía es vital para evitar conflictos y gestionar la gobernanza de herramientas en equipos grandes.

### **3.1. Skills de Workspace (Alcance Local)**

* **Ruta:** \<workspace-root\>/.agent/skills/.10  
* **Propósito:** Contener lógica específica del proyecto. Esto incluye scripts de despliegue para la infraestructura particular de esa aplicación, linters con reglas específicas del repositorio, o generadores de código para frameworks internos.10  
* **Portabilidad:** Al estar dentro del repositorio del proyecto, estos Skills se comparten a través del control de versiones (Git). Esto garantiza que cualquier desarrollador que clone el repositorio tenga acceso inmediato a las mismas capacidades del agente, facilitando el "onboarding" técnico.15

### **3.2. Skills Globales (Alcance de Usuario)**

* **Ruta Actualizada (Enero 2026):** \~/.gemini/antigravity/skills/.16  
* **Ruta Obsoleta/Conflictiva:** \~/.gemini/antigravity/global\_skills/.  
* **Propósito:** Herramientas universales que el desarrollador desea tener disponibles en todos sus proyectos, como generadores de UUID, formateadores de JSON, o herramientas de productividad personal.10

#### **El Conflicto de Nomenclatura: global\_skills vs skills**

Una investigación técnica de los foros de la comunidad y la documentación evolutiva revela una discrepancia significativa que ha causado fricción en la adopción temprana. Mientras que la documentación beta y algunos tutoriales iniciales referenciaban la carpeta global\_skills 10, la implementación de producción hacia finales de enero de 2026 estandarizó la ruta a skills dentro del directorio de configuración del usuario para alinearse con los estándares de interoperabilidad de Anthropic.16

**Diagnóstico y Solución:** Los ingenieros que experimenten que sus Skills globales no son detectados deben verificar manualmente la estructura de directorios. La solución probada es renombrar la carpeta de global\_skills a skills. No existe una interfaz gráfica en Antigravity para gestionar estas rutas, por lo que la gestión del sistema de archivos es manual.18

### **3.3. Lógica de Resolución de Conflictos (Shadowing)**

Cuando existen Skills con el mismo nombre en ambos alcances, Antigravity aplica una lógica de prioridad estricta diseñada para favorecer la especificidad sobre la generalidad.15

| Prioridad | Alcance | Comportamiento del Sistema |
| :---- | :---- | :---- |
| **1 (Alta)** | Workspace (.agent/skills/) | Sobrescribe cualquier definición global. Permite "forking" de herramientas globales para adaptarlas a necesidades específicas del proyecto sin afectar otros trabajos. |
| **2 (Baja)** | Global (\~/.gemini/...) | Se carga solo si no existe un homónimo en el Workspace. Actúa como una capa base de capacidades ("fallback"). |

Este mecanismo de "Shadowing" (Sombreado) es crucial para la seguridad y la estabilidad. Un proyecto que requiere una versión específica y antigua de una herramienta de despliegue puede definirla localmente en .agent/skills/deploy, garantizando que la versión global más moderna (y quizás incompatible) no se ejecute accidentalmente en ese entorno crítico.15

## ---

**4\. Estado del Arte: Ecosistemas y Casos de Uso (Enero 2026\)**

Hacia finales de enero de 2026, la comunidad de desarrollo ha madurado más allá de los ejemplos triviales, creando repositorios robustos de Skills que demuestran el potencial real de la plataforma. El repositorio @rmyndharis/antigravity-skills se destaca como un referente del estado del arte.19

### **4.1. Análisis de Caso: @rmyndharis/antigravity-skills**

Este repositorio ilustra cómo los Skills pueden encapsular conocimientos de alto nivel y metodologías complejas, no solo scripts de automatización simple.

#### **4.1.1. Skill Cognitivo: Threat Modeling Expert (Experto en Modelado de Amenazas)**

Este Skill 19 es un ejemplo paradigmático de un "Skill Cognitivo". No se centra principalmente en ejecutar scripts, sino en guiar al agente a través de un proceso de razonamiento estructurado.

* **Capacidades:** Implementa metodologías de seguridad estándar de la industria como STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) y construcción de árboles de ataque.  
* **Funcionamiento:** Instruye al agente para que analice la arquitectura del sistema descrita en los archivos del proyecto, identifique límites de confianza y genere un informe de riesgos priorizado.  
* **Valor Ingenieril:** Democratiza el conocimiento de seguridad avanzada, permitiendo que un desarrollador generalista realice una revisión de seguridad preliminar de alta calidad sin ser un experto en ciberseguridad.

#### **4.1.2. Skill de Negocio: Market Sizing Analysis**

Este Skill 20 demuestra la versatilidad de Antigravity fuera del código puro.

* **Metodología:** Guía al usuario a través de frameworks de análisis de mercado (TAM, SAM, SOM) utilizando enfoques Top-Down y Bottom-Up.  
* **Aplicación:** Permite a fundadores técnicos y gerentes de producto validar la viabilidad comercial de una nueva funcionalidad o servicio directamente desde el IDE, integrando la estrategia de negocio en el flujo de trabajo de desarrollo.

#### **4.1.3. Skill Técnico: Backend Security Coder**

A diferencia del experto en modelado, este es un Skill de implementación "manos a la obra".22

* **Enfoque:** Se centra en la escritura de código seguro: validación de inputs, prevención de inyecciones SQL/NoSQL, y manejo seguro de errores.  
* **Restricciones:** Impone reglas estrictas, como el uso exclusivo de consultas parametrizadas y la prohibición de exponer detalles del sistema en mensajes de error. Actúa como un linter semántico en tiempo real.

### **4.2. Interoperabilidad con Claude Code**

Existe una convergencia notable entre los ecosistemas de Google Antigravity y Claude Code (Anthropic). Debido a que ambos adoptaron el estándar SKILL.md, es técnicamente viable portar skills de una plataforma a otra con cambios mínimos.21 Herramientas comunitarias permiten instalar skills diseñados para Claude en Antigravity (e.g., npx skills add...), lo que multiplica exponencialmente la biblioteca de capacidades disponibles para los usuarios de Antigravity sin esperar a un ecosistema nativo exclusivo.23

## ---

**5\. Implementación Avanzada: Patrones "Hardcore" y Meta-Skills**

Para el arquitecto de software que busca maximizar el potencial de la plataforma, el diseño de Skills va más allá de tareas simples. Los patrones avanzados permiten la creación de agentes cuasi-autónomos capaces de gestionar ciclos de vida completos de desarrollo.

### **5.1. Meta-Skills: El Agente como Gerente**

Un **Meta-Skill** se define como un Skill cuyo propósito principal no es ejecutar una tarea terminal, sino orquestar la invocación y coordinación de otros Skills.24 Transforma al agente de un "trabajador" a un "gerente".

**Arquitectura de un Meta-Skill de Implementación (feature-architect):**

Este Meta-Skill podría tener la siguiente lógica en su SKILL.md:

1. **Fase de Planificación:** Invocar el Skill tech-spec-writer para generar un documento de especificación técnica basado en la solicitud del usuario.  
2. **Fase de Desglose:** Analizar la especificación y dividirla en tareas discretas (backend, frontend, base de datos).  
3. **Fase de Delegación:**  
   * Para cambios en base de datos, invocar database-migration-tool.  
   * Para la API, invocar fastapi-scaffold.  
   * Para la interfaz, invocar react-component-gen.  
4. **Fase de Verificación:** Al finalizar, invocar obligatoriamente visual-regression-tester y security-audit.

La implementación técnica de esto requiere instrucciones que fomenten el razonamiento recursivo y la planificación secuencial. El agente debe ser instruido para mantener un "estado" mental del progreso del proyecto a través de los distintos pasos.25

### **5.2. Patrones de Auto-Corrección y Resiliencia (Three-Strike Protocol)**

Los agentes pueden fallar. Un Skill robusto debe anticipar el fallo y proporcionar mecanismos de recuperación. El "Protocolo de Tres Strikes" es un patrón de diseño emergente en la comunidad avanzada 27:

* **Intento 1 (Ejecución):** El agente intenta realizar la tarea (ej. ejecutar un test).  
* **Fallo 1 (Diagnóstico):** Si falla, el Skill instruye al agente a leer el stderr, analizar el error, y proponer una solución sin pedir ayuda humana aún.  
* **Intento 2 (Refinamiento):** El agente aplica la corrección y reintenta.  
* **Fallo 2 (Re-ingeniería):** Si falla de nuevo, el agente debe reconsiderar el enfoque fundamental (ej. ¿está mal la dependencia? ¿es un error de entorno?).  
* **Intento 3 (Escalada):** Si falla una tercera vez, el Skill obliga al agente a detenerse y solicitar intervención humana, presentando un informe detallado de los intentos fallidos.

Este patrón se codifica explícitamente en la sección de instrucciones del SKILL.md, programando la persistencia y la tolerancia al fallo del modelo.27

### **5.3. Capacidades Multimodales y Testing Visual**

La integración de capacidades multimodales (visión) en Gemini 3 Pro permite Skills que cierran la brecha entre el código y la experiencia visual del usuario.28

Caso de Uso: Visual Regression Testing 28

1. **Captura:** Un script en el Skill (scripts/capture.js) utiliza Playwright o Puppeteer para renderizar un componente y tomar una captura de pantalla, guardándola en una ruta temporal.  
2. **Análisis:** El agente utiliza comandos de contenedor como container.open\_image 31 para "ver" la captura generada.  
3. **Comparación Cognitiva:** En lugar de una simple comparación píxel a píxel (que es frágil), el agente compara la captura actual con una imagen de referencia o con un mockup de diseño, utilizando su capacidad de razonamiento visual para detectar discrepancias semánticas (ej. "El botón está desplazado", "El color no coincide con la guía de estilo").  
4. **Reporte:** El agente genera un feedback descriptivo sobre la interfaz gráfica, algo imposible para un linter de código tradicional.

## ---

**6\. Seguridad, Gobernanza y Restricciones**

La capacidad de los Skills para ejecutar scripts en la terminal del usuario introduce vectores de ataque significativos. La seguridad en Antigravity no es una característica opcional, sino un requisito fundamental de arquitectura.

### **6.1. Modelos de Permisos de Ejecución**

Antigravity gestiona el riesgo mediante modos de operación que controlan la autonomía del agente 1:

* **Always Ask (Siempre Preguntar):** Es la configuración por defecto y la más segura. Cada vez que un Skill intenta ejecutar un comando de terminal (especialmente aquellos con potencial destructivo como rm o escrituras de archivos), el IDE pausa la ejecución y presenta un diálogo de confirmación al usuario. Esto mantiene al humano en el bucle ("human-in-the-loop") como la autoridad final de validación.13  
* **Auto-Execute (Ejecución Automática):** Puede habilitarse para entornos de confianza o tareas específicas repetitivas. Sin embargo, su uso con Skills de terceros no auditados es extremadamente riesgoso, ya que un agente podría ejecutar scripts maliciosos o exfiltrar datos sin supervisión inmediata.

### **6.2. Listas de Control de Acceso (Allow/Deny Lists)**

Para mitigar riesgos a nivel de sistema, los administradores pueden configurar listas de control 2:

* **Deny List (Lista de Denegación):** Permite bloquear el acceso del agente a directorios sensibles del sistema de archivos (ej. \~/.ssh, /etc, variables de entorno del sistema). Esto previene que un Skill malicioso o un agente confundido lea claves privadas o configuraciones críticas.  
* **Seguridad de Red:** Se pueden restringir los dominios a los que el agente puede conectarse, previniendo la exfiltración de código a servidores externos no autorizados.33

### **6.3. Auditoría de Skills de Terceros**

La importación de Skills desde repositorios comunitarios debe tratarse con la misma diligencia que la instalación de paquetes de npm o PyPI. Un Skill aparentemente inocente podría contener instrucciones en su SKILL.md diseñadas para realizar "Prompt Injection" sobre el agente, manipulándolo para ignorar sus directrices de seguridad, o contener scripts ofuscados en la carpeta scripts/.13 La recomendación de ingeniería es auditar siempre el contenido de scripts/ y las instrucciones de SKILL.md antes de instalar un Skill en el ámbito global.

## ---

**7\. Conclusión: El Futuro de la Ingeniería Asistida**

A fecha de enero de 2026, la funcionalidad de Skills en Google Antigravity representa la maduración de la IA generativa en el ciclo de vida del desarrollo de software. Ya no estamos ante herramientas experimentales de chat, sino ante plataformas de ingeniería robustas donde la intención se traduce en acción a través de interfaces estandarizadas y seguras.

La adopción de Skills permite a las organizaciones:

1. **Estandarizar el Conocimiento:** Codificar las "mejores prácticas" tribales en activos ejecutables y distribuibles.  
2. **Reducir la Carga Cognitiva:** Permitir que los desarrolladores se centren en la arquitectura y la lógica de negocio, delegando la implementación repetitiva y la validación a agentes especializados.  
3. **Acelerar el Onboarding:** Un nuevo desarrollador puede ser productivo desde el día uno si el repositorio cuenta con un set robusto de Skills de Workspace que guíen su flujo de trabajo.

El "Vibe Coding" puede haber comenzado como una tendencia cultural, pero con la arquitectura de Skills, se ha transformado en una disciplina de ingeniería viable y potente. El arquitecto de software del futuro cercano no solo escribirá código; diseñará y curará las habilidades de los agentes que construirán ese código.

#### **Obras citadas**

1. Master Google Antigravity Skills: Build Autonomous AI Agents \- Vertu, fecha de acceso: enero 28, 2026, [https://vertu.com/lifestyle/mastering-google-antigravity-skills-a-comprehensive-guide-to-agentic-extensions-in-2026/](https://vertu.com/lifestyle/mastering-google-antigravity-skills-a-comprehensive-guide-to-agentic-extensions-in-2026/)  
2. Getting Started with Google Antigravity, fecha de acceso: enero 28, 2026, [https://codelabs.developers.google.com/getting-started-google-antigravity](https://codelabs.developers.google.com/getting-started-google-antigravity)  
3. Tutorial : Getting Started with Google Antigravity | by Romin Irani \- Medium, fecha de acceso: enero 28, 2026, [https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2](https://medium.com/google-cloud/tutorial-getting-started-with-google-antigravity-b5cc74c103c2)  
4. Introducing the AI model 'MiniMax M2.1,' which outperforms Gemini 3.0 Pro and GPT-5.2 in some tests. \- GIGAZINE, fecha de acceso: enero 28, 2026, [https://gigazine.net/gsc\_news/en/20251224-minimax-m2-1/](https://gigazine.net/gsc_news/en/20251224-minimax-m2-1/)  
5. Google Antigravity | AI Coding Tools \- Real Python, fecha de acceso: enero 28, 2026, [https://realpython.com/ref/ai-coding-tools/google-antigravity/](https://realpython.com/ref/ai-coding-tools/google-antigravity/)  
6. Google Antigravity, fecha de acceso: enero 28, 2026, [https://antigravity.google/](https://antigravity.google/)  
7. Google's Antigravity is live. What does it mean for vibecoding? \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/vibecoding/comments/1p0uvnu/googles\_antigravity\_is\_live\_what\_does\_it\_mean\_for/](https://www.reddit.com/r/vibecoding/comments/1p0uvnu/googles_antigravity_is_live_what_does_it_mean_for/)  
8. Vibe Code with Gemini \- Google AI Studio, fecha de acceso: enero 28, 2026, [https://aistudio.google.com/vibe-code](https://aistudio.google.com/vibe-code)  
9. Tutorial : Getting Started with Google Antigravity Skills, fecha de acceso: enero 28, 2026, [https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d](https://medium.com/google-cloud/tutorial-getting-started-with-antigravity-skills-864041811e0d)  
10. Agent Skills \- Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/skills](https://antigravity.google/docs/skills)  
11. Authoring Google Antigravity Skills, fecha de acceso: enero 28, 2026, [https://codelabs.developers.google.com/getting-started-with-antigravity-skills](https://codelabs.developers.google.com/getting-started-with-antigravity-skills)  
12. Skill authoring best practices \- Claude API Docs, fecha de acceso: enero 28, 2026, [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)  
13. What are Google Antigravity Skills? Build 24/7 AI Agents | VERTU, fecha de acceso: enero 28, 2026, [https://vertu.com/lifestyle/mastering-google-antigravity-skills-the-ultimate-guide-to-extending-agentic-ai-in-2026/](https://vertu.com/lifestyle/mastering-google-antigravity-skills-the-ultimate-guide-to-extending-agentic-ai-in-2026/)  
14. antigravity now supports skill · Issue \#74 · nextlevelbuilder/ui-ux-pro-max-skill \- GitHub, fecha de acceso: enero 28, 2026, [https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/issues/74](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/issues/74)  
15. Gemini CLI Tutorial Series — Part 11: Gemini CLI Extensions | by Romin Irani \- Medium, fecha de acceso: enero 28, 2026, [https://medium.com/google-cloud/gemini-cli-tutorial-series-part-11-gemini-cli-extensions-69a6f2abb659](https://medium.com/google-cloud/gemini-cli-tutorial-series-part-11-gemini-cli-extensions-69a6f2abb659)  
16. Antigravity \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/google\_antigravity/best/](https://www.reddit.com/r/google_antigravity/best/)  
17. Antigravity tip: here's where to put your global and project-specific Agent Skills. \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/google\_antigravity/comments/1qo5u47/antigravity\_tip\_heres\_where\_to\_put\_your\_global/](https://www.reddit.com/r/google_antigravity/comments/1qo5u47/antigravity_tip_heres_where_to_put_your_global/)  
18. skills not working on antigravity : r/google\_antigravity \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/google\_antigravity/comments/1qkf52l/skills\_not\_working\_on\_antigravity/](https://www.reddit.com/r/google_antigravity/comments/1qkf52l/skills_not_working_on_antigravity/)  
19. threat-modeling-expert by rmyndharis/antigravity-skills, fecha de acceso: enero 28, 2026, [https://skills.sh/rmyndharis/antigravity-skills/threat-modeling-expert](https://skills.sh/rmyndharis/antigravity-skills/threat-modeling-expert)  
20. Market Sizing Analysis \- Claude Code Skill for TAM/SAM/SOM, fecha de acceso: enero 28, 2026, [https://mcpmarket.com/tools/skills/market-sizing-analysis-2](https://mcpmarket.com/tools/skills/market-sizing-analysis-2)  
21. llm-application-dev-langchain-agent by rmyndharis/antigravity-skills, fecha de acceso: enero 28, 2026, [https://skills.sh/rmyndharis/antigravity-skills/llm-application-dev-langchain-agent](https://skills.sh/rmyndharis/antigravity-skills/llm-application-dev-langchain-agent)  
22. backend-security-coder by rmyndharis/antigravity-skills, fecha de acceso: enero 28, 2026, [https://skills.sh/rmyndharis/antigravity-skills/backend-security-coder](https://skills.sh/rmyndharis/antigravity-skills/backend-security-coder)  
23. I ported 300+ Claude Code Agent skills to work with Google Antigravity – Free & Open Source : r/google\_antigravity \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/google\_antigravity/comments/1qivwe6/i\_ported\_300\_claude\_code\_agent\_skills\_to\_work/](https://www.reddit.com/r/google_antigravity/comments/1qivwe6/i_ported_300_claude_code_agent_skills_to_work/)  
24. antigravity-skills/docs/Antigravity\_Skills\_Manual.en.md at main ..., fecha de acceso: enero 28, 2026, [https://github.com/guanyang/antigravity-skills/blob/main/docs/Antigravity\_Skills\_Manual.en.md](https://github.com/guanyang/antigravity-skills/blob/main/docs/Antigravity_Skills_Manual.en.md)  
25. Skills Officially Comes to Codex \- Hacker News, fecha de acceso: enero 28, 2026, [https://news.ycombinator.com/item?id=46334424](https://news.ycombinator.com/item?id=46334424)  
26. Skills They Don't Teach You in Tutorials but Companies Actually Pay ..., fecha de acceso: enero 28, 2026, [https://dev.to/thebitforge/skills-they-dont-teach-you-in-tutorials-but-companies-actually-pay-for-11om](https://dev.to/thebitforge/skills-they-dont-teach-you-in-tutorials-but-companies-actually-pay-for-11om)  
27. How I Built a Manus-Style Workflow Inside AntiGravity (For Free) : r/AISEOInsider \- Reddit, fecha de acceso: enero 28, 2026, [https://www.reddit.com/r/AISEOInsider/comments/1qltpf0/how\_i\_built\_a\_manusstyle\_workflow\_inside/](https://www.reddit.com/r/AISEOInsider/comments/1qltpf0/how_i_built_a_manusstyle_workflow_inside/)  
28. Claude the frontend dev \- Martijn Arts, fecha de acceso: enero 28, 2026, [https://blog.martijnarts.com/claude-the-frontend-dev/](https://blog.martijnarts.com/claude-the-frontend-dev/)  
29. Gemini 3 for developers: New reasoning, agentic capabilities \- Google Blog, fecha de acceso: enero 28, 2026, [https://blog.google/innovation-and-ai/technology/developers-tools/gemini-3-developers/](https://blog.google/innovation-and-ai/technology/developers-tools/gemini-3-developers/)  
30. e2e-testing-patterns by rmyndharis/antigravity-skills, fecha de acceso: enero 28, 2026, [https://skills.sh/rmyndharis/antigravity-skills/e2e-testing-patterns](https://skills.sh/rmyndharis/antigravity-skills/e2e-testing-patterns)  
31. All recent content \- Simon Willison's Weblog, fecha de acceso: enero 28, 2026, [https://simonwillison.net/dashboard/all-recent-content/](https://simonwillison.net/dashboard/all-recent-content/)  
32. Rules / Workflows \- Google Antigravity Documentation, fecha de acceso: enero 28, 2026, [https://antigravity.google/docs/rules-workflows](https://antigravity.google/docs/rules-workflows)  
33. Blogmarks that use markdown \- Simon Willison's Weblog, fecha de acceso: enero 28, 2026, [https://simonwillison.net/dashboard/blogmarks-that-use-markdown/](https://simonwillison.net/dashboard/blogmarks-that-use-markdown/)