"use client";

import React, { useState, useEffect } from 'react';

export default function VistaPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error al obtener datos:", err));
  }, []);

  const handleDownload = () => {
    window.open("/api/download", "_blank");
  };

  // Lista de columnas en el orden solicitado
  const columns = [
    "item",
    "nombre",
    "piso",
    "tipoUso",
    "sede",
    "dependencia",
    "equipoTipo",
    "equipoSerial",
    "equipoModelo",
    "equipoMarca",
    "equipoSO",
    "equipoRAM",
    "equipoProcesador",
    "equipoDisco",
    "fechaEntrega",
    "hostname",
    "observaciones",
    "entregaNombreSoporte",
    "entregaFirma",
    "recibeAreaCargo",
    "recibeNombre",
    "recibeFirma",
    "infraestructuraNombre",
    "infraestructuraFirma",
    "rhPuntaMedicaNombre",
    "rhFirma"
  ];

  // Estilos de la página
  const containerStyle = {
    minHeight: '100vh',
    padding: '40px',
    background: 'linear-gradient(135deg, #a2cfff 0%, #90f7ec 100%)'
  };

  const titleStyle = {
    textAlign: 'center',
    color: '#333',
    fontSize: '3em',
    fontWeight: 'bold',
    marginBottom: '20px',
    textTransform: 'uppercase'
  };

  const tableOuterWrapperStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    marginTop: '20px'
  };

  const tableScrollWrapperStyle = {
    overflowX: 'auto'
  };

  // Establecemos un minWidth amplio para la tabla dado el número de columnas
  const tableStyle = {
    minWidth: '1500px',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    backgroundColor: '#b2ebf2',
    color: '#333',
    padding: '10px',
    border: '1px solid #ccc',
    textTransform: 'capitalize'
  };

  const tdStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    verticalAlign: 'middle'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1500px', margin: '0 auto' }}>
        <h1 style={titleStyle}>Vista de Datos del Excel</h1>
        <button
          onClick={handleDownload}
          style={{
            backgroundColor: '#ffeb3b',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Descargar Excel
        </button>

        <div style={tableOuterWrapperStyle}>
          <div style={tableScrollWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col} style={thStyle}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {columns.map((col) => {
                      // Si la columna es de firma, la renderizamos como imagen
                      if (col.toLowerCase().includes("firma")) {
                        const firmaBase64 = row[col];
                        if (firmaBase64 && firmaBase64.startsWith("data:image/")) {
                          return (
                            <td key={col} style={tdStyle}>
                              <img
                                src={firmaBase64}
                                alt={`Firma ${col}`}
                                style={{ maxWidth: '150px', maxHeight: '80px' }}
                              />
                            </td>
                          );
                        } else {
                          return <td key={col} style={tdStyle}>Sin firma</td>;
                        }
                      } else {
                        // Columnas de texto
                        return (
                          <td key={col} style={tdStyle}>
                            {row[col] || ""}
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
