from flask import request, jsonify, current_app
from werkzeug.security import generate_password_hash
import pymysql
from bd import obtener_conexion
import os
import json
import re


def validar_email(email):
    """Verifica si el email tiene un formato válido."""
    patron = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(patron, email) is not None

def registrarSucursal():
    # Obtener datos del formulario
    nombre = request.form.get("nombre")
    email = request.form.get("email")
    telefono = request.form.get("telefono")
    direccion = request.form.get("direccion")
    ciudad = request.form.get("ciudad")
    password = request.form.get("password")
    departamento = request.form.get("departamento")
    codigo_postal = request.form.get("codigo_postal")
    pais = request.form.get("pais")
    activo = request.form.get("activo")

    # Validar que los datos requeridos estén presentes
    if not nombre or not email or not telefono or not direccion or not ciudad or not departamento or not codigo_postal or not pais:
        return jsonify({"error": "Faltan datos requeridos"}), 400

    # Validar el formato del email
    if not validar_email(email):
        return jsonify({"error": "Formato de email inválido"}), 400

    # Validar que el campo activo sea 0 o 1
    if activo not in ["0", "1"]:
        return jsonify({"error": "Valor inválido para el campo 'activo'"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            # Verificar si el email ya existe en la base de datos
            cursor.execute("SELECT id FROM sucursales WHERE email = %s", (email,))
            sucursal_existente = cursor.fetchone()
            if sucursal_existente:
                return jsonify({"error": "El email ya está registrado"}), 400
            

            password_hash = generate_password_hash(password)


            cursor.execute(
                """
                INSERT INTO usuarios (email, password, rol, activo) 
                VALUES (%s, %s, %s, %s)
                """,
                (email, password_hash, 'Sucursal', int(activo))
            )

            cursor.execute("SELECT idUsuario FROM usuarios WHERE email = %s", (email,))
            idUsuarioCreate = cursor.fetchone()

            # Insertar nueva sucursal
            cursor.execute(
                """
                INSERT INTO sucursales (idUsuario, nombre, email, telefono, direccion, ciudad, departamento, codigo_postal, pais, activo) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (idUsuarioCreate, nombre, email, telefono, direccion, ciudad, departamento, codigo_postal, pais, int(activo))
            )
            conexion.commit()
            return jsonify({"mensaje": "Sucursal registrada exitosamente"}), 201

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()



def obtenerSucursales():
    try:
        with obtener_conexion() as conexion, conexion.cursor() as cursor:
            query = """
                SELECT * FROM sucursales

            """
            cursor.execute(query)
            sucursales = cursor.fetchall()
            sucursales_lista = [{
                "id": sucursales[0],
                "idUsuario": sucursales[1],
                "nombre": sucursales[2],
                "direccion": sucursales[3],
                "telefono": sucursales[4],
                "email": sucursales[5],
                "ciudad": sucursales[6],
                "codigo_postal": sucursales[7],
                "pais": sucursales[8],
                "departamento": sucursales[9],
                "activo": sucursales[10],
                "fecha_creacion": sucursales[11]
            } for sucursales in sucursales]

            return jsonify(sucursales_lista)

    except Exception as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500


def updateSucursal():
    conexion = obtener_conexion()

    # Obtener datos del formulario (ahora correctamente desde JSON)
    data = request.get_json()  # ← Cambiado a JSON
    idSucursal = data.get("idSucursal")  # ← Cambiado para leer JSON
    nombre = data.get("nombre")
    email = data.get("email")
    telefono = data.get("telefono")
    activo = data.get("activo")  # Nuevo campo

    # Dirección
    direccion = data.get("direccion")
    ciudad = data.get("ciudad")
    departamento = data.get("departamento")  # Antes era 'estado'
    codigo_postal = data.get("codigo_postal")  # Nuevo campo
    pais = data.get("pais")  # Nuevo campo

    # Validar que los datos obligatorios estén presentes
    if not idSucursal or not nombre or not email or not telefono:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    try:
        with conexion.cursor() as cursor:
            # Consulta SQL para actualizar la sucursal
            query = """
                UPDATE sucursales 
                SET nombre = %s, email = %s, telefono = %s, activo = %s, 
                    direccion = %s, ciudad = %s, departamento = %s, 
                    codigo_postal = %s, pais = %s
                WHERE id = %s  -- ← Asegurar que coincide con la DB
            """
            values = [
                nombre, email, telefono, activo,
                direccion, ciudad, departamento,
                codigo_postal, pais, idSucursal
            ]
            
            cursor.execute(query, tuple(values))
            conexion.commit()

        return jsonify({"success": True, "message": "Sucursal actualizada correctamente"})

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error desconocido: {str(e)}"}), 500
    finally:
        conexion.close()
