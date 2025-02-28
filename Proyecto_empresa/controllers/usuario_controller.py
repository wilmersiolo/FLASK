from flask import jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
import pymysql
from bd import obtener_conexion

def registrar_usuario():
    datos = request.get_json()
    nombre = datos.get("nombre")
    email = datos.get("email")
    password = datos.get("password")
    
    if not nombre or not email or not password:
        return jsonify({"error": "Faltan datos requeridos"}), 400
    
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT idUsuario FROM usuarios WHERE email = %s", (email,))
            if cursor.fetchone():
                return jsonify({"error": "El correo ya está registrado"}), 409
            
            password_hash = generate_password_hash(password)
            cursor.execute(
                "INSERT INTO usuarios (nombre, email, password) VALUES (%s, %s, %s)",
                (nombre, email, password_hash)
            )
            conexion.commit()
            return jsonify({"mensaje": "Usuario registrado exitosamente"}), 201
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()

def validar_login():
    datos = request.get_json()
    email = datos.get("usuario")
    password = datos.get("password")
    
    if not email or not password:
        return jsonify({"error": "Debe ingresar usuario y contraseña"}), 400
    
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT idUsuario, rol, password FROM usuarios WHERE email = %s", (email,))
            usuario = cursor.fetchone()
            if not usuario or not check_password_hash(usuario[2], password):
                return jsonify({"error": "Usuario o contraseña incorrectos"}), 401
            
            session["usuario_id"] = usuario[0]
            session["rol"] = usuario[1]
            return jsonify({"mensaje": "Inicio de sesión exitoso"}), 200
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()
