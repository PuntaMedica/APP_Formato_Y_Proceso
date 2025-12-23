'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SignatureCanvas from 'react-signature-canvas';

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ user: '', password: '' });

  // Datos del formulario
  const [formData, setFormData] = useState({
    item: '',
    nombre: '',
    piso: '',
    tipoUso: '',
    sede: '',
    dependencia: '',
    equipoTipo: '',
    equipoSerial: '',
    equipoModelo: '',
    equipoMarca: '',
    equipoSO: '',
    equipoRAM: '',
    equipoProcesador: '',
    equipoDisco: '',
    fechaEntrega: '',
    hostname: '',
    observaciones: '',
    entregaNombreSoporte: '',
    recibeAreaCargo: '',
    recibeNombre: '',
    infraestructuraNombre: '',
    rhPuntaMedicaNombre: '',
    infraestructuraFirma: '',
    rhFirma: '',
    entregaFirma: '',
    recibeFirma: ''
  });

  // Referencias para las firmas
  const sigCanvasInfra = useRef(null);
  const sigCanvasRH = useRef(null);
  const sigCanvasEntrega = useRef(null);
  const sigCanvasRecibe = useRef(null);

  useEffect(() => {
  }, []);

  // Manejadores de login
  const handleLoginChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      if (res.ok) {
        setIsLoggedIn(true);
        toast.success('Login exitoso', { position: 'top-right' });
      } else {
        toast.error('Credenciales inválidas', { position: 'top-right' });
      }
    } catch (err) {
      toast.error('Error de conexión al servidor', { position: 'top-right' });
    }
  };

  // Manejador de logout
  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setIsLoggedIn(false);
  };

  // Manejador de cambios en formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Limpiar firmas
  const clearInfra = () => sigCanvasInfra.current.clear();
  const clearRH = () => sigCanvasRH.current.clear();
  const clearEntrega = () => sigCanvasEntrega.current.clear();
  const clearRecibe = () => sigCanvasRecibe.current.clear();

  // Envío de formulario
  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      toast.error('El campo "Nombre" es obligatorio', { position: 'top-right' });
      return;
    }
    if (
      sigCanvasInfra.current.isEmpty() ||
      sigCanvasRH.current.isEmpty() ||
      sigCanvasEntrega.current.isEmpty() ||
      sigCanvasRecibe.current.isEmpty()
    ) {
      toast.error('Todas las firmas son obligatorias', { position: 'top-right' });
      return;
    }

    // Obtener imágenes de firmas
    const finalData = {
      ...formData,
      infraestructuraFirma: sigCanvasInfra.current.toDataURL('image/png'),
      rhFirma: sigCanvasRH.current.toDataURL('image/png'),
      entregaFirma: sigCanvasEntrega.current.toDataURL('image/png'),
      recibeFirma: sigCanvasRecibe.current.toDataURL('image/png')
    };

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      if (res.ok) {
        toast.success('Formulario guardado con éxito!', { position: 'top-right', autoClose: 4000 });
      } else {
        toast.error('Error al guardar el formulario.', { position: 'top-right' });
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor.', { position: 'top-right' });
    }
  };

  // Si no está autenticado, regresar al login
  if (!isLoggedIn) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)'
      }}>
        <ToastContainer />
        <div style={{
          background: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          padding: '40px',
          width: '320px',
          textAlign: 'center',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#1F2937', fontSize: '24px' }}>Bienvenido</h2>
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '15px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>Usuario</label>
              <input
                name="user"
                value={credentials.user}
                onChange={handleLoginChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#374151' }}>Contraseña</label>
              <input
                name="password"
                type="password"
                value={credentials.password}
                onChange={handleLoginChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#3B82F6',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              Iniciar Sesión
            </button>
          </form>
          <p style={{ marginTop: '15px', fontSize: '12px', color: '#6B7280' }}>
            © 2025 PuntaMedica
          </p>
        </div>
      </div>
    );
  }

  // Si está autenticado, mostrar el formulario completo
  return (
    <div style={{ backgroundColor: '#b2ebf2', padding: '20px' }}>
      <ToastContainer />
      <div style={{ backgroundColor: '#fff', margin: '0 auto', padding: '20px', maxWidth: '1200px' }}>
        
        {/* ENCABEZADO */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <img src="/logo.jpg" alt="Logo" style={{ width: '100px' }} />
          <div style={{ textAlign: 'center' }}>
            <h1>FORMATO: Infraestructura y Tecnología PuntaMedica</h1>
            <h2>PROCESO: GESTIÓN DE TECNOLOGÍAS DE LA INFORMACIÓN</h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p>Versión: 1.0</p>
            <p>13/03/2025</p>
            <p>Código: IT-A-01</p>
          </div>
        </header>

        {/* CONTENEDOR DE SECCIONES */}
        <section style={{ marginTop: '20px' }}>
          {/* ITEM */}
          <div style={{ backgroundColor: '#fff', padding: '10px', marginBottom: '10px', border: '2px solid #000' }}>
            <strong style={{ display: 'block', marginBottom: '5px' }}>ITEM:</strong>
            <input
              type="text"
              name="item"
              value={formData.item}
              onChange={handleChange}
              style={{
                width: '240px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '2px'
              }}
            />
          </div>

          {/* DATOS */}
          <div style={{ backgroundColor: '#fff', padding: '10px', marginBottom: '10px', border: '2px solid #000' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>DATOS:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <label>Nombre: </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Piso: </label>
                <input
                  type="text"
                  name="piso"
                  value={formData.piso}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Tipo Uso: </label>
                <input
                  type="text"
                  name="tipoUso"
                  value={formData.tipoUso}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Sede: </label>
                <input
                  type="text"
                  name="sede"
                  value={formData.sede}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Dependencia: </label>
                <input
                  type="text"
                  name="dependencia"
                  value={formData.dependencia}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN EQUIPO */}
          <div style={{ backgroundColor: '#fff', padding: '10px', marginBottom: '10px', border: '2px solid #000' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>EQUIPO:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {/* Campos de equipo */}
              <div>
                <label>Tipo: </label>
                <input
                  type="text"
                  name="equipoTipo"
                  value={formData.equipoTipo}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Serial: </label>
                <input
                  type="text"
                  name="equipoSerial"
                  value={formData.equipoSerial}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Modelo: </label>
                <input
                  type="text"
                  name="equipoModelo"
                  value={formData.equipoModelo}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Marca: </label>
                <input
                  type="text"
                  name="equipoMarca"
                  value={formData.equipoMarca}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>SO: </label>
                <input
                  type="text"
                  name="equipoSO"
                  value={formData.equipoSO}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>RAM: </label>
                <input
                  type="text"
                  name="equipoRAM"
                  value={formData.equipoRAM}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Procesador: </label>
                <input
                  type="text"
                  name="equipoProcesador"
                  value={formData.equipoProcesador}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
              <div>
                <label>Disco: </label>
                <input
                  type="text"
                  name="equipoDisco"
                  value={formData.equipoDisco}
                  onChange={handleChange}
                  style={{
                    marginLeft: '5px',
                    width: '200px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '2px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* FECHA DE ENTREGA */}
          <div style={{ backgroundColor: '#fff', padding: '10px', border: '2px solid #000' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>FECHA DE ENTREGA:</strong>
            <input
              type="date"
              name="fechaEntrega"
              value={formData.fechaEntrega}
              onChange={handleChange}
              style={{
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '2px'
              }}
            />
          </div>

          {/* OTROS */}
          <div style={{ backgroundColor: '#fff', padding: '10px', border: '2px solid #000', marginTop: '10px' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>OTROS:</strong>
            <label>Hostname: </label>
            <input
              type="text"
              name="hostname"
              value={formData.hostname}
              onChange={handleChange}
              style={{
                marginLeft: '5px',
                width: '200px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '2px'
              }}
            />
          </div>

          {/* OBSERVACIONES */}
          <div style={{ backgroundColor: '#fff', padding: '10px', border: '2px solid #000', marginTop: '10px' }}>
            <strong style={{ display: 'block', marginBottom: '10px' }}>OBSERVACIONES:</strong>
            <textarea
              rows="5"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              style={{
                width: '100%',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '5px'
              }}
            />
          </div>

          {/* POLÍTICA DE SOFTWARE */}
          <div
            style={{
              backgroundColor: '#f2f2f2',
              padding: '10px',
              border: '2px solid #000',
              marginTop: '10px'
            }}
          >
            <strong>POLITICA DE SOFTWARE</strong>
            <p style={{ marginTop: '10px', textAlign: 'justify' }}>
              “Ningún servidor público, contratista o personal externo, interno; podrá instalar software en los equipos
              que sean propiedad de Centro  Medico los Encinos "Puntamedica", sin la previa autorización por parte de
              Direccion Sistemas, Soporte Técnico y la correspondiente licencia del software correspondiente"
            </p>
          </div>

          {/* MANIFIESTO */}
          <div
            style={{
              backgroundColor: '#f2f2f2',
              padding: '10px',
              border: '2px solid #000',
              marginTop: '10px'
            }}
          >
            <strong>MANIFIESTO</strong>
            <p style={{ marginTop: '10px', textAlign: 'justify' }}>
              La Direccion de Sistemas, hace entrega de los recursos de TI relacionados en este documento y a su vez el usuario
              recibe a satisfacción  y manifiesta según revisión realizada las siguientes condiciones:
              <br /><br />
              <strong>PRIMERO:</strong> Que el equipo de computo recibido cuenta con el software base debidamente instalado y
              licenciado, además está prohibido instalar software no licenciado y software de uso libre.
              <br />
              <strong>SEGUNDO:</strong> Que utilizará el hardware y software para el desempeño único y exclusivo de las funciones
              relacionadas con su cargo en  Centro Medico los Encinos "Puntamedica".
              <br />
              <strong>TERCERO:</strong> Que cuidará del buen estado de los equipos recibidos para su correcto funcionamiento,
              evitando derramar sustancias liquidas y/o comestibles, etc, sobre cualquier elemento informático. Evitará que los
              equipos sean golpeados o expuestos a ambientes hostiles (temperatura, humedad, etc.), que puedan afectar su
              funcionamiento.
              <br />
              <strong>CUARTO:</strong> Los elementos recibidos vienen con componentes adicionales que se relacionan en
              este documento, se entregan como un todo integrado, esto quiere decir que no intercambiará partes (monitor,
              teclado, mouse, cargadores, etc.) entre equipos ni usuarios. Cualquier traslado o cambio de componentes
              debe estar autorizado por el área de Recursos Físicos y deberá notificarlo a Soporte Técnico Centro Medico
              los Encinos "Puntamedica". Se debe llevar un estricto control del inventario y responsables de los equipos.
              <br />
              <strong>QUINTO:</strong> Daré estricto cumplimiento a las políticas generales de seguridad de la
              Información y la guia de uso y acceso a servicios Informaticos, precisamente buscando resguardar la
              información confiada por Centro Medico los Encinos "Puntamedica".
              <br />
              <strong>SEXTO:</strong> Me responsabilizo de los equipos informáticos portátiles entregados bajo mi
              custodia y durante mi permanencia en las instalaciones de Centro Medico los Encinos "Puntamedica". Fuera de
              dichas instalaciones asumiré los costos en caso de pérdida, robo o daño.
              <br />
              <br />
              En conocimiento de lo anterior, manifiesto a conformidad haber recibido la asesoría pertinente por parte
              del ingeniero de soporte con el fin de dar un uso adecuado al equipo de cómputo.
            </p>
          </div>

          {/* ENTREGA / RECIBE */}
          <div style={{ backgroundColor: '#fff', padding: '10px', border: '2px solid #000', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              {/* ENTREGA */}
              <div style={{ flex: '1' }}>
                <strong>ENTREGA</strong>
                <div style={{ marginTop: '8px' }}>Soporte TI</div>
                <div style={{ marginTop: '8px' }}>
                  <label>Nombre: </label>
                  <input
                    type="text"
                    name="entregaNombreSoporte"
                    value={formData.entregaNombreSoporte}
                    onChange={handleChange}
                    style={{
                      marginLeft: '5px',
                      width: '180px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '2px'
                    }}
                  />
                </div>

                {/* Firma ENTREGA */}
                <div style={{ marginTop: '8px' }}>
                  <SignatureCanvas
                    ref={sigCanvasEntrega}
                    penColor="black"
                    canvasProps={{
                      width: 200,
                      height: 100,
                      style: { border: '1px solid #ccc' }
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearEntrega}
                    style={{
                      marginTop: '5px',
                      border: '1px solid #aaa',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '2px 5px'
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              {/* RECIBE */}
              <div style={{ flex: '1' }}>
                <strong>RECIBE</strong>
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    name="recibeAreaCargo"
                    placeholder="Área / Cargo"
                    value={formData.recibeAreaCargo}
                    onChange={handleChange}
                    style={{
                      width: '180px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '2px'
                    }}
                  />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <label>Nombre: </label>
                  <input
                    type="text"
                    name="recibeNombre"
                    value={formData.recibeNombre}
                    onChange={handleChange}
                    style={{
                      marginLeft: '5px',
                      width: '180px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '2px'
                    }}
                  />
                </div>

                {/* Firma RECIBE */}
                <div style={{ marginTop: '8px' }}>
                  <SignatureCanvas
                    ref={sigCanvasRecibe}
                    penColor="black"
                    canvasProps={{
                      width: 200,
                      height: 100,
                      style: { border: '1px solid #ccc' }
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearRecibe}
                    style={{
                      marginTop: '5px',
                      border: '1px solid #aaa',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '2px 5px'
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VO. BO. / GERENCIA RH / INFRAESTRUCTURA Y TECNO / RH PUNTAMEDICA */}
          <div style={{ backgroundColor: '#fff', padding: '10px', border: '2px solid #000', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
              <div style={{ flex: '1' }}>
                <strong>Vo. Bo.</strong>
              </div>
              <div style={{ flex: '1' }}>
                <strong>Gerencia de RH</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ flex: '1' }}>
                Infraestructura y Tecnología
                <div style={{ marginTop: '8px' }}>
                  <label>Nombre: </label>
                  <input
                    type="text"
                    name="infraestructuraNombre"
                    value={formData.infraestructuraNombre}
                    onChange={handleChange}
                    style={{
                      marginLeft: '5px',
                      width: '180px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '2px'
                    }}
                  />
                </div>

                {/* Firma Infra */}
                <div style={{ marginTop: '8px' }}>
                  <SignatureCanvas
                    ref={sigCanvasInfra}
                    penColor="black"
                    canvasProps={{
                      width: 200,
                      height: 100,
                      style: { border: '1px solid #ccc' }
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearInfra}
                    style={{
                      marginTop: '5px',
                      border: '1px solid #aaa',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '2px 5px'
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </div>

              <div style={{ flex: '1' }}>
                RH PuntaMedica
                <div style={{ marginTop: '8px' }}>
                  <label>Nombre: </label>
                  <input
                    type="text"
                    name="rhPuntaMedicaNombre"
                    value={formData.rhPuntaMedicaNombre}
                    onChange={handleChange}
                    style={{
                      marginLeft: '5px',
                      width: '180px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '2px'
                    }}
                  />
                </div>

                {/* Firma RH */}
                <div style={{ marginTop: '8px' }}>
                  <SignatureCanvas
                    ref={sigCanvasRH}
                    penColor="black"
                    canvasProps={{
                      width: 200,
                      height: 100,
                      style: { border: '1px solid #ccc' }
                    }}
                  />
                  <button
                    type="button"
                    onClick={clearRH}
                    style={{
                      marginTop: '5px',
                      border: '1px solid #aaa',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      padding: '2px 5px'
                    }}
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BOTÓN ENVIAR */}
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={handleSubmit}
              style={{
                backgroundColor: '#b2ebf2',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Enviar Formulario
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}
