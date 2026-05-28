import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSessionRepository } from '@/data/useSessionRepository';
import { parseHealthImport } from '@/domain/health/parseHealthImport';
import { normalizeUserProfile, type Sex } from '@/domain/profile/userProfile';

import { buildBackupFilename } from './buildBackupFilename';

function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
    reader.readAsText(file);
  });
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function Settings({ now = () => new Date() }: { now?: () => Date } = {}) {
  const repo = useSessionRepository();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [healthMessage, setHealthMessage] = useState<string | null>(null);
  const [profileHeight, setProfileHeight] = useState<string>('');
  const [profileBirthdate, setProfileBirthdate] = useState<string>('');
  const [profileSex, setProfileSex] = useState<Sex | ''>('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.getProfile().then((stored) => {
      if (cancelled || !stored) return;
      setProfileHeight(String(stored.heightCm));
      setProfileBirthdate(stored.birthdate);
      setProfileSex(stored.sex);
    });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError(null);
    setProfileMessage(null);

    const candidate = normalizeUserProfile(
      {
        heightCm: Number(profileHeight),
        birthdate: profileBirthdate,
        sex: profileSex,
      },
      now(),
    );

    if (!candidate) {
      setProfileError(
        'Perfil inválido. Comprueba altura (>0), fecha de nacimiento (no futura, edad ≥ 5) y sexo.',
      );
      return;
    }

    await repo.setProfile(candidate);
    setProfileMessage('Perfil guardado.');
  }

  async function handleExport() {
    const stamp = now();
    const payload = await repo.exportAll(stamp);
    downloadJson(buildBackupFilename(stamp), payload);
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    let text: string;
    try {
      text = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(reader.error ?? new Error('FileReader error'));
        reader.readAsText(file);
      });
    } catch (err) {
      setError(`No se pudo leer el fichero: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      setError('El fichero no es un JSON válido.');
      return;
    }

    if (
      !window.confirm(
        '¿Reemplazar todos los datos actuales con este backup? Esta acción no se puede deshacer.',
      )
    ) {
      event.target.value = '';
      return;
    }

    try {
      await repo.importAll(payload);
      navigate('/');
    } catch (err) {
      setError(`No se pudo importar: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleHealthImport(event: ChangeEvent<HTMLInputElement>) {
    setError(null);
    setHealthMessage(null);
    const file = event.target.files?.[0];
    if (!file) return;

    let text: string;
    try {
      text = await readFileText(file);
    } catch (err) {
      setError(`No se pudo leer el fichero: ${err instanceof Error ? err.message : String(err)}`);
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch (parseErr) {
      const detail = parseErr instanceof Error ? parseErr.message : String(parseErr);
      const flatten = (s: string) => s.replace(/\s+/g, ' ').trim();
      const head = flatten(text.slice(0, 200));
      const tail = flatten(text.slice(-200));
      setError(
        `El fichero no es un JSON válido. Detalle: ${detail}. Longitud: ${text.length} caracteres. Inicio: «${head}». Final: «${tail}».`,
      );
      return;
    }

    try {
      const days = parseHealthImport(payload);
      await repo.upsertHealthDays(days);
      setHealthMessage(
        `Importados ${days.length} ${days.length === 1 ? 'día' : 'días'} de actividad.`,
      );
    } catch (err) {
      setError(
        `No se pudieron importar los datos de Salud: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return (
    <section data-testid="route-settings">
      <h2 className="page-title">Ajustes</h2>

      <p className="notice">
        Tus entrenamientos se guardan solo en este dispositivo. Exporta una copia periódicamente
        para no perder tu historial.
      </p>

      <div className="settings-actions">
        <button type="button" className="btn btn-primary btn-full" onClick={handleExport}>
          Exportar
        </button>
        <label className="btn btn-secondary btn-full settings-import">
          <span>Importar</span>
          <input type="file" accept="application/json" onChange={handleImport} />
        </label>
      </div>

      <h3 id="perfil" className="settings-section-title">
        Perfil
      </h3>
      <p className="notice">
        Usamos estos datos para calcular tu BMR (energía en reposo). Se almacenan localmente.
      </p>
      <form className="profile-form" onSubmit={handleProfileSubmit} noValidate>
        <div className="profile-form__row">
          <label htmlFor="profile-height">Altura (cm)</label>
          <input
            id="profile-height"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="50"
            max="260"
            value={profileHeight}
            onChange={(e) => setProfileHeight(e.target.value)}
            required
          />
        </div>
        <div className="profile-form__row">
          <label htmlFor="profile-birthdate">Fecha de nacimiento</label>
          <input
            id="profile-birthdate"
            type="date"
            value={profileBirthdate}
            onChange={(e) => setProfileBirthdate(e.target.value)}
            required
          />
        </div>
        <fieldset className="profile-form__sex">
          <legend>Sexo</legend>
          <label>
            <input
              type="radio"
              name="profile-sex"
              value="male"
              checked={profileSex === 'male'}
              onChange={() => setProfileSex('male')}
            />
            Hombre
          </label>
          <label>
            <input
              type="radio"
              name="profile-sex"
              value="female"
              checked={profileSex === 'female'}
              onChange={() => setProfileSex('female')}
            />
            Mujer
          </label>
        </fieldset>
        <button type="submit" className="btn btn-primary btn-full">
          Guardar perfil
        </button>
      </form>
      {profileMessage ? (
        <p role="status" className="settings-success">
          {profileMessage}
        </p>
      ) : null}
      {profileError ? (
        <p role="alert" className="alert-error">
          {profileError}
        </p>
      ) : null}

      <h3 className="settings-section-title">Datos de Salud</h3>
      <p className="notice">
        Importa pasos y distancia diaria desde la app Salud del iPhone (vía un Atajo que genera un
        JSON). Se fusionan por día: reimportar no duplica.
      </p>
      <div className="settings-actions">
        <label className="btn btn-secondary btn-full settings-import">
          <span>Importar datos de Salud</span>
          <input
            type="file"
            accept=".json,.txt,application/json,text/plain"
            onChange={handleHealthImport}
          />
        </label>
      </div>

      <details className="health-help">
        <summary>¿Cómo configuro el Atajo? (paso a paso para principiantes)</summary>

        <p>
          Vamos a crear un Atajo de Apple que vuelca tus pasos y distancia diaria en un fichero
          JSON. Lo explico desde cero, sin asumir nada.
        </p>

        <h4>Conceptos básicos</h4>
        <ul>
          <li>
            <strong>Acción</strong>: cada bloque que pones en el atajo (buscar datos, transformar
            texto, guardar archivo, etc.). El atajo entero es una pila de acciones que se ejecutan
            en orden, de arriba abajo.
          </li>
          <li>
            <strong>Variable mágica</strong>: cuando una acción produce un resultado, las acciones
            siguientes pueden usarlo. Lo verás como una &laquo;burbuja&raquo; coloreada con el
            nombre del resultado. Cuando aparezca, se toca para ajustarla (p. ej. elegir qué
            propiedad usar).
          </li>
        </ul>

        <p>
          Cada vez que digo &laquo;añade la acción X&raquo;: toca la barra de búsqueda (&laquo;
          Buscar acciones&raquo;), escribe X y toca el resultado.
        </p>

        <details>
          <summary>Parte 0 — Crear un atajo nuevo</summary>
          <ol>
            <li>
              En el iPhone busca la app <strong>Atajos</strong> (icono morado con dos cuadrados
              superpuestos). Si no la tienes, está gratis en la App Store.
            </li>
            <li>
              Abre la app. Abajo del todo verás pestañas. Toca{' '}
              <strong>&laquo;Mis atajos&raquo;</strong>.
            </li>
            <li>
              Arriba a la derecha hay un <strong>&laquo;+&raquo;</strong>. Tócalo: se abre un atajo
              en blanco.
            </li>
            <li>
              Toca el título &laquo;Atajo nuevo&raquo; arriba, elige{' '}
              <strong>&laquo;Renombrar&raquo;</strong> y ponle <code>Exportar Salud</code>.
            </li>
          </ol>
        </details>

        <details>
          <summary>Parte 1 — Versión mínima: guardar solo los pasos</summary>

          <p>
            Vamos a llegar primero a guardar un archivo solo con pasos. Cuando funcione, añadimos la
            distancia (Parte 2).
          </p>

          <h5>Acción 1 · Buscar muestras de Pasos</h5>
          <ol>
            <li>
              Busca <code>muestras</code> y toca{' '}
              <strong>&laquo;Buscar muestras médicas&raquo;</strong>.
            </li>
            <li>
              Toca donde dice <strong>&laquo;Tipo de muestra&raquo;</strong> y elige{' '}
              <strong>&laquo;Pasos&raquo;</strong>.
            </li>
            <li>Si la app pide permiso para datos de Salud, di que sí.</li>
          </ol>

          <h5>Acción 2 · Repetir con cada muestra</h5>
          <p>Esta acción crea un bucle: por cada muestra de pasos hará cosas dentro.</p>
          <ol>
            <li>
              Busca <code>repetir</code> y toca <strong>&laquo;Repetir con cada&raquo;</strong>.
            </li>
            <li>
              Se añaden DOS bloques:{' '}
              <strong>&laquo;Repetir con cada [Muestras médicas]&raquo;</strong> y{' '}
              <strong>&laquo;Fin de Repetir&raquo;</strong>. Todo lo que metas{' '}
              <strong>entre</strong> esos dos bloques se ejecuta una vez por muestra.
            </li>
            <li>
              Si una acción no queda dentro del bucle, mantén pulsado sobre ella y arrástrala entre
              los dos bloques.
            </li>
          </ol>

          <h5>Acción 3 (dentro del bucle) · Formatear la fecha</h5>
          <p>
            Convertimos la fecha de inicio de cada muestra a un formato simple{' '}
            <code>2026-05-25</code>.
          </p>
          <ol>
            <li>
              Toca el <strong>&laquo;+&raquo;</strong> que aparece entre &laquo;Repetir con
              cada&raquo; y &laquo;Fin de Repetir&raquo;.
            </li>
            <li>
              Busca <code>formatear fecha</code> y toca{' '}
              <strong>&laquo;Formatear fecha&raquo;</strong>.
            </li>
            <li>
              En el campo <strong>&laquo;Fecha&raquo;</strong>, borra lo que haya dentro.
            </li>
            <li>
              Con el cursor parpadeando, encima del teclado aparece una fila de sugerencias de
              variables. Toca <strong>&laquo;Elemento de repetición&raquo;</strong> (representa la
              muestra actual del bucle).
            </li>
            <li>
              Aparece una burbuja con ese nombre. <strong>Toca la burbuja</strong>: en la hoja que
              se abre, elige <strong>&laquo;Fecha de inicio&raquo;</strong>. La burbuja debe pasar a
              decir &laquo;Fecha de inicio&raquo;.
            </li>
            <li>
              Despliega <strong>&laquo;Mostrar más&raquo;</strong> si no está abierto. En{' '}
              <strong>&laquo;Formato de fecha&raquo;</strong> elige{' '}
              <strong>&laquo;Personalizado&raquo;</strong> y en el campo &laquo;Formato&raquo;
              escribe exactamente: <code>yyyy-MM-dd</code>.
            </li>
          </ol>

          <h5>Acción 4 (dentro del bucle) · Construir el fragmento JSON</h5>
          <ol>
            <li>
              Dentro del bucle, busca <code>texto</code> y toca <strong>&laquo;Texto&raquo;</strong>{' '}
              (la acción con icono de &laquo;T&raquo;).
            </li>
            <li>
              En el campo grande escribe literalmente, dejando un hueco donde van las dos variables:
              <pre>
                <code>{'{"metric":"steps","date":"AQUI_FECHA","value":AQUI_VALOR},'}</code>
              </pre>
            </li>
            <li>
              Borra <code>AQUI_FECHA</code> y con el cursor ahí, toca{' '}
              <strong>&laquo;Fecha formateada&raquo;</strong> en la fila de sugerencias (es la
              salida de la Acción 3).
            </li>
            <li>
              Borra <code>AQUI_VALOR</code>. Con el cursor ahí, toca{' '}
              <strong>&laquo;Elemento de repetición&raquo;</strong>. Aparece la burbuja:{' '}
              <strong>tócala</strong> y elige <strong>&laquo;Cantidad&raquo;</strong>.
            </li>
            <li>
              <strong>Vuelve a tocar la burbuja &laquo;Cantidad&raquo;</strong>: dentro hay un
              selector <strong>&laquo;Tipo&raquo;</strong>. Cámbialo a{' '}
              <strong>&laquo;Magnitud&raquo;</strong>. Esto es clave: si no, se imprime con la
              unidad (&laquo;1200 pasos&raquo;) y rompe el JSON.
            </li>
          </ol>
          <p>
            Resultado: la acción Texto produce algo tipo{' '}
            <code>{'{"metric":"steps","date":«Fecha»,"value":«Magnitud»},'}</code>. La coma final es
            a propósito: la limpiamos al final.
          </p>

          <h5>Acción 5 (dentro del bucle) · Acumular en una variable</h5>
          <ol>
            <li>
              Dentro del bucle, busca <code>añadir a variable</code> y toca{' '}
              <strong>&laquo;Añadir a variable&raquo;</strong>.
            </li>
            <li>
              En <strong>&laquo;Nombre de variable&raquo;</strong> escribe <code>AcumPasos</code>.
            </li>
            <li>
              El valor de entrada por defecto debe ser <strong>&laquo;Texto&raquo;</strong> (salida
              de la Acción 4). Si no, tócalo y elígelo de las sugerencias.
            </li>
          </ol>

          <h5>Acción 6 (FUERA del bucle) · Envolver en JSON válido</h5>
          <ol>
            <li>
              Después de &laquo;Fin de Repetir&raquo;, añade otra acción{' '}
              <strong>&laquo;Texto&raquo;</strong>.
            </li>
            <li>
              Escribe:
              <pre>
                <code>{'{"version":2,"samples":[AQUI_ACUM]}'}</code>
              </pre>
            </li>
            <li>
              Borra <code>AQUI_ACUM</code> y con el cursor ahí, toca{' '}
              <strong>&laquo;AcumPasos&raquo;</strong> en la fila de sugerencias. Si no aparece,
              toca la varita mágica (✨) y búscala en la lista.
            </li>
          </ol>

          <h5>Acción 7 · Quitar la coma colgante</h5>
          <ol>
            <li>
              Busca <code>reemplazar texto</code> y toca{' '}
              <strong>&laquo;Reemplazar texto&raquo;</strong>.
            </li>
            <li>
              &laquo;Buscar texto&raquo;: <code>,]</code>
            </li>
            <li>
              &laquo;Reemplazar con&raquo;: <code>]</code>
            </li>
            <li>El input es la salida del paso 6 (debería estar puesto por defecto).</li>
          </ol>

          <h5>Acción 8 · Verificar con Vista rápida</h5>
          <ol>
            <li>
              Busca <code>vista rápida</code> y toca <strong>&laquo;Vista rápida&raquo;</strong>. Su
              input es el <strong>Texto</strong> del paso 7. Te lo enseña en pantalla antes de
              guardarlo.
            </li>
          </ol>
          <p>
            En la Vista rápida deberías ver un JSON tipo{' '}
            <code>{'{"version":2,"samples":[{"metric":"steps", ...}]}'}</code>. Si ves comas
            colgantes (<code>,]</code>), comillas raras (<code>“ ”</code> curvas en vez de{' '}
            <code>&quot;</code> rectas) o valores con unidades pegadas (<code>1200 pasos</code>),
            corrige los pasos anteriores antes de seguir.
          </p>

          <h5>Acción 9 · Guardar el archivo</h5>
          <ol>
            <li>
              Busca <code>guardar archivo</code> y toca{' '}
              <strong>&laquo;Guardar archivo&raquo;</strong>.
            </li>
            <li>
              Su input es el <strong>Texto</strong> del paso 7.
            </li>
            <li>
              <strong>Activa el interruptor &laquo;Preguntar dónde guardar&raquo;</strong>. Sin
              esto, guarda en silencio y no ves el diálogo.
            </li>
            <li>
              En <strong>&laquo;Nombre de archivo&raquo;</strong> escribe <code>salud</code> (sin
              extensión).
            </li>
          </ol>
          <p>
            Atajos siempre añade extensión <code>.txt</code> a un texto, así que el fichero
            resultante será <code>salud.txt</code>. <strong>No pasa nada</strong>: el contenido es
            JSON y la app acepta tanto <code>.json</code> como <code>.txt</code> al importar. Si
            prefieres tenerlo con extensión <code>.json</code>, después de guardarlo entra en la app{' '}
            <strong>Archivos</strong>, mantén pulsado el fichero → <strong>Renombrar</strong> y
            cambia <code>.txt</code> por <code>.json</code>.
          </p>

          <h5>Probar la versión mini</h5>
          <ol>
            <li>
              Abajo del editor del atajo hay un botón redondo de <strong>play (►)</strong>. Tócalo.
            </li>
            <li>La primera vez pedirá permiso para Salud: di que sí.</li>
            <li>
              Verás la <strong>Vista rápida</strong> con el JSON. Toca{' '}
              <strong>&laquo;Hecho&raquo;</strong>.
            </li>
            <li>
              Aparece el diálogo de Archivos. Elige carpeta (p. ej.{' '}
              <strong>iCloud Drive → Atajos</strong> o <strong>En mi iPhone</strong>) y toca{' '}
              <strong>&laquo;Guardar&raquo;</strong>.
            </li>
          </ol>
        </details>

        <details>
          <summary>Parte 2 — Añadir la distancia</summary>
          <p>
            Repetimos en paralelo a los pasos. Insértalo <strong>entre la Acción 5</strong>{' '}
            (&laquo;Añadir a variable AcumPasos&raquo;) y la <strong>Acción 6</strong> (Texto
            envolvente).
          </p>
          <ol>
            <li>
              <strong>&laquo;Buscar muestras médicas&raquo;</strong> con tipo{' '}
              <strong>&laquo;Distancia a pie y en carrera&raquo;</strong>.
            </li>
            <li>
              <strong>&laquo;Repetir con cada&raquo;</strong> (otro bucle nuevo).
            </li>
            <li>
              Dentro del bucle nuevo:
              <ul>
                <li>
                  <strong>&laquo;Formatear fecha&raquo;</strong>: Elemento de repetición → Fecha de
                  inicio, formato <code>yyyy-MM-dd</code>.
                </li>
                <li>
                  <strong>&laquo;Texto&raquo;</strong> con:
                  <pre>
                    <code>{'{"metric":"distance","date":"«Fecha»","value":«Magnitud»},'}</code>
                  </pre>
                  (Magnitud = Elemento de repetición → Cantidad → Tipo &laquo;Magnitud&raquo;).
                </li>
                <li>
                  <strong>&laquo;Añadir a variable&raquo;</strong> con nombre{' '}
                  <code>AcumDistancia</code>.
                </li>
              </ul>
            </li>
            <li>
              En la <strong>Acción 6 (Texto envolvente)</strong>, cambia el contenido a:
              <pre>
                <code>{'{"version":2,"samples":[«AcumPasos»«AcumDistancia»]}'}</code>
              </pre>
              (las dos burbujas pegadas, sin coma ni espacio entre ellas).
            </li>
          </ol>
          <p>
            La Acción 7 (reemplazar <code>,]</code> por <code>]</code>) sigue igual y limpia la
            última coma sea de pasos o distancia.
          </p>
        </details>

        <details>
          <summary>Comprobaciones y resolución de problemas</summary>
          <ul>
            <li>
              <strong>Unidad de distancia</strong>: en la Vista rápida, si los <code>value</code> de
              distancia son números enormes (tipo <code>923</code> donde esperabas <code>0.92</code>
              ), vienen en metros. Antes de la acción Texto del bucle de distancia, añade{' '}
              <strong>&laquo;Convertir medida&raquo;</strong> de metros a kilómetros y usa la
              magnitud convertida en el Texto.
            </li>
            <li>
              <strong>No aparece una variable en las sugerencias</strong>: toca el icono de varita
              mágica (✨) sobre el teclado para ver la lista completa de variables.
            </li>
            <li>
              <strong>El diálogo &laquo;Guardar&raquo; no aparece</strong>: revisa que{' '}
              <strong>&laquo;Preguntar dónde guardar&raquo;</strong> esté activado en la acción
              &laquo;Guardar archivo&raquo;.
            </li>
            <li>
              <strong>JSON con valores raros tipo &laquo;1200 pasos&raquo;</strong>: la burbuja
              &laquo;Cantidad&raquo; no está en Tipo &laquo;Magnitud&raquo;. Tócala y cámbialo.
            </li>
            <li>
              <strong>
                El archivo se guarda como <code>.txt</code>
              </strong>
              : es lo esperado. Atajos siempre añade <code>.txt</code> al guardar un texto. La app
              acepta tanto <code>.json</code> como <code>.txt</code> al importar, así que
              selecciónalo tal cual. Si prefieres tenerlo con extensión <code>.json</code>,
              renómbralo desde la app Archivos (mantén pulsado → Renombrar).
            </li>
          </ul>
        </details>

        <h4>Formato resultante</h4>
        <pre>
          <code>
            {
              '{ "version": 2, "samples": [ { "metric": "steps", "date": "2026-05-25", "value": 1200 }, { "metric": "distance", "date": "2026-05-25", "value": 0.92 } ] }'
            }
          </code>
        </pre>
        <p>
          La app agrupa las muestras por <strong>día local</strong> y suma por <code>metric</code>.
          Después de generar el fichero, ven aquí y selecciónalo en{' '}
          <strong>&laquo;Importar datos de Salud&raquo;</strong>.
        </p>
      </details>

      {healthMessage ? (
        <p role="status" className="settings-success">
          {healthMessage}
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="alert-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
