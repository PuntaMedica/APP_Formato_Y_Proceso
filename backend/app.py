# backend/app.py

from flask import Flask, request, jsonify, send_file, session, g
from flask_cors import CORS
# --- CÓDIGO ANTERIOR COMENTADO (Excel) ---
# import pandas as pd
import pyodbc # --- NUEVO CÓDIGO SQL SERVER ---
import os
import io
from functools import wraps

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'  # Cámbiala por algo seguro

# Permitimos credenciales (cookies de sesión) desde el front
CORS(app, supports_credentials=True)

# --- NUEVA CONFIGURACIÓN SQL SERVER ---
SQL_CONN_STR = (
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=DESKTOP-EO74OCH\\SQLEXPRESS;"
    "Database=gestion_imagenes;"
    "Trusted_Connection=yes;"
    "Encrypt=no;"
    "TrustServerCertificate=yes;"
)

# Columnas para el formulario
columnas = [
    "item", "nombre", "piso", "tipoUso", "sede", "dependencia",
    "equipoTipo", "equipoSerial", "equipoModelo", "equipoMarca",
    "equipoSO", "equipoRAM", "equipoProcesador", "equipoDisco",
    "fechaEntrega", "hostname", "observaciones", "entregaNombreSoporte",
    "entregaFirma", "recibeAreaCargo", "recibeNombre", "recibeFirma",
    "infraestructuraNombre", "infraestructuraFirma", "rhPuntaMedicaNombre", "rhFirma"
]

def get_db():
    if 'db' not in g:
        g.db = pyodbc.connect(SQL_CONN_STR)
    return g.db

@app.teardown_appcontext
def close_db(exception):
    db = g.pop('db', None)
    if db is not None:
        db.close()

# ===================== INICIALIZACIÓN DE TABLAS SQL SERVER =====================
def init_form_tables():
    db = get_db()
    cursor = db.cursor()
    
    # Tabla para el formulario (usando VARCHAR(MAX) para firmas/observaciones)
    # Creamos las columnas dinámicamente basadas en tu lista
    cols_sql = ", ".join([f"[{col}] NVARCHAR(MAX)" for col in columnas])
    cursor.execute(f'''
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='datosFormulario' AND xtype='U')
        CREATE TABLE datosFormulario (
            id_form INT IDENTITY(1,1) PRIMARY KEY,
            fecha_registro DATETIME DEFAULT GETDATE(),
            {cols_sql}
        )
    ''')
    
    # Tabla de usuarios para este módulo si no existe la general
    cursor.execute('''
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='usuarios_proceso' AND xtype='U')
        CREATE TABLE usuarios_proceso (
            id INT IDENTITY(1,1) PRIMARY KEY,
            [user] VARCHAR(100) UNIQUE,
            password VARCHAR(100)
        )
    ''')
    db.commit()

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('logged_in'):
            return jsonify({'error': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = data.get('user', '')
    password = data.get('password', '')

    # --- CÓDIGO ANTERIOR COMENTADO (Excel) ---
    # if not os.path.exists('usuarios.xlsx'): ...
    # df_users = pd.read_excel('usuarios.xlsx')
    # match = df_users[(df_users['user'] == user) & (df_users['password'] == password)]
    
    # --- LÓGICA SQL SERVER ---
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT [user] FROM usuarios_proceso WHERE [user] = ? AND password = ?", (user, password))
    match = cursor.fetchone()

    if match:
        session['logged_in'] = True
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False}), 401

@app.route('/submit', methods=['POST'])
@login_required
def submit():
    data = request.get_json()
    
    # --- CÓDIGO ANTERIOR COMENTADO (Excel) ---
    # if not os.path.exists("datosFormulario.xlsx"): ...
    # nueva_fila = {col: data.get(col, "") for col in columnas}
    # df = pd.concat([df, pd.DataFrame([nueva_fila])], ignore_index=True)
    # df.to_excel("datosFormulario.xlsx", index=False)

    # --- LÓGICA SQL SERVER ---
    db = get_db()
    cursor = db.cursor()
    
    # Construcción dinámica del INSERT
    cols_str = ", ".join([f"[{col}]" for col in columnas])
    placeholders = ", ".join(["?" for _ in columnas])
    values = [str(data.get(col, "")) for col in columnas]
    
    cursor.execute(f"INSERT INTO datosFormulario ({cols_str}) VALUES ({placeholders})", tuple(values))
    db.commit()

    return jsonify({"message": "Formulario guardado con éxito"}), 200

@app.route("/data", methods=["GET"])
@login_required
def get_data():
    # --- CÓDIGO ANTERIOR COMENTADO (Excel) ---
    # if not os.path.exists("datosFormulario.xlsx"): ...
    # df = pd.read_excel("datosFormulario.xlsx")
    
    # --- LÓGICA SQL SERVER ---
    db = get_db()
    cursor = db.cursor()
    cursor.execute(f"SELECT {', '.join(['['+c+']' for c in columnas])} FROM datosFormulario ORDER BY id_form DESC")
    
    rows = cursor.fetchall()
    results = [dict(zip(columnas, row)) for row in rows]
    
    return jsonify(results)

@app.route("/download", methods=["GET"])
@login_required
def download_excel():
    # --- CÓDIGO ANTERIOR COMENTADO (Excel directo) ---
    # return send_file("datosFormulario.xlsx", ...)

    # --- LÓGICA SQL SERVER (Generación de Excel al vuelo) ---
    try:
        import pandas as pd
        db = get_db()
        # Leemos de SQL y pasamos a DataFrame
        query = f"SELECT {', '.join(['['+c+']' for c in columnas])} FROM datosFormulario"
        df = pd.read_sql(query, db)
        
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Datos Formulario')
        output.seek(0)

        return send_file(
            output,
            as_attachment=True,
            download_name="datosFormulario.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        return jsonify({"error": f"Error al generar archivo: {str(e)}"}), 500

if __name__ == "__main__":
    with app.app_context():
        init_form_tables()
    app.run(debug=True, host='0.0.0.0', port=5800)