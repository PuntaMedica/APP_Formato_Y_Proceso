from flask import Flask, request, jsonify, send_file, session
from flask_cors import CORS
import pandas as pd
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = 'tu_clave_secreta'  # Cámbiala por algo seguro
# Permitimos credenciales (cookies de sesión) desde el front
CORS(app, supports_credentials=True)

# Columnas para el Excel de datos de formulario
columnas = [
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
]

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

    if not os.path.exists('usuarios.xlsx'):
        return jsonify({'success': False, 'error': 'User database not found'}), 500

    df_users = pd.read_excel('usuarios.xlsx')
    # Columnas esperadas: 'user' y 'password'
    match = df_users[(df_users['user'] == user) & (df_users['password'] == password)]
    if not match.empty:
        session['logged_in'] = True
        return jsonify({'success': True}), 200
    else:
        return jsonify({'success': False}), 401

@app.route('/submit', methods=['POST'])
@login_required
def submit():
    data = request.get_json()
    if not os.path.exists("datosFormulario.xlsx"):
        df = pd.DataFrame(columns=columnas)
    else:
        df = pd.read_excel("datosFormulario.xlsx")

    nueva_fila = {col: data.get(col, "") for col in columnas}
    df = pd.concat([df, pd.DataFrame([nueva_fila])], ignore_index=True)
    df.to_excel("datosFormulario.xlsx", index=False)

    return jsonify({"message": "Formulario guardado con éxito"}), 200

@app.route("/data", methods=["GET"])
@login_required
def get_data():
    if not os.path.exists("datosFormulario.xlsx"):
        return jsonify([])
    df = pd.read_excel("datosFormulario.xlsx")
    df = df[columnas]
    return jsonify(df.to_dict(orient="records"))

@app.route("/download", methods=["GET"])
@login_required
def download_excel():
    if not os.path.exists("datosFormulario.xlsx"):
        return jsonify({"error": "No existe el archivo Excel."}), 404
    return send_file(
        "datosFormulario.xlsx",
        as_attachment=True,
        download_name="datosFormulario.xlsx"
    )

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5800)
