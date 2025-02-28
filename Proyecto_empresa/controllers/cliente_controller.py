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

def registrarCliente():
    # Obtener datos del formulario
    nombre = request.form.get("nombre")
    apellido = request.form.get("apellido")
    email = request.form.get("email")
    telefono = request.form.get("telefono")
    direccion = request.form.get("direccion")
    ciudad = request.form.get("ciudad")
    departamento = request.form.get("departamento")

    # Validar que los datos requeridos estén presentes
    if not nombre or not apellido or not email or not telefono or not direccion or not ciudad or not departamento:
        return jsonify({"error": "Faltan datos requeridos"}), 400

    # Validar el formato del email
    if not validar_email(email):
        return jsonify({"error": "Formato de email inválido"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            # Verificar si el email ya existe en la base de datos
            cursor.execute("SELECT idCliente FROM clientes WHERE email = %s", (email,))
            cliente_existente = cursor.fetchone()
            if cliente_existente:
                return jsonify({"error": "El email ya está registrado"}), 400

            password_hash = generate_password_hash(telefono)


            cursor.execute(
                """
                INSERT INTO usuarios (email, password, rol, activo) 
                VALUES (%s, %s, %s, %s)
                """,
                (email, password_hash, 'Cliente', '1')
            )

            cursor.execute("SELECT idUsuario FROM usuarios WHERE email = %s", (email,))
            idUsuarioCreate = cursor.fetchone()

            # Insertar nuevo cliente si el email no existe
            cursor.execute(
                """
                INSERT INTO clientes (idUsuario, nombre, apellido, email, telefono, direccion, ciudad, departamento) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (idUsuarioCreate, nombre, apellido, email, telefono, direccion, ciudad, departamento)
            )

            conexion.commit()
            return jsonify({"mensaje": "Cliente registrado exitosamente"}), 201

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()


def obtenerClientes():
    try:
        with obtener_conexion() as conexion, conexion.cursor() as cursor:
            query = """
                SELECT * FROM clientes

            """
            cursor.execute(query)
            clientes = cursor.fetchall()
            clientes_lista = [{
                "idCliente": clientes[0],
                "idUsuario": clientes[1],
                "nombre": clientes[2],
                "apellido": clientes[3],
                "email": clientes[4],
                "telefono": clientes[5],
                "direccion": clientes[6],
                "ciudad": clientes[7],
                "departamento": clientes[8],
                "fecha_registro": clientes[9]
            } for clientes in clientes]

            return jsonify(clientes_lista)

    except Exception as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500


def updateCliente():
    conexion = obtener_conexion()

    # Obtener datos del formulario
    idCliente = request.json.get("idCliente")
    nombre = request.json.get("nombre")
    apellido = request.json.get("apellido")
    email = request.json.get("email")
    telefono = request.json.get("telefono")
    direccion = request.json.get("direccion")
    ciudad = request.json.get("ciudad")
    departamento = request.json.get("departamento")

    # Validar que los datos obligatorios estén presentes
    if not idCliente or not nombre or not apellido or not email or not telefono:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    try:
        with conexion.cursor() as cursor:
            # Consulta SQL para actualizar el cliente
            query = """
                UPDATE clientes 
                SET nombre = %s, apellido = %s, email = %s, 
                    telefono = %s, direccion = %s, ciudad = %s, departamento = %s
                WHERE idCliente = %s
            """
            values = [nombre, apellido, email, telefono, direccion, ciudad, departamento, idCliente]
            
            cursor.execute(query, tuple(values))
            conexion.commit()

        return jsonify({"success": True, "message": "Cliente actualizado correctamente"})

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Error desconocido: {str(e)}"}), 500
    finally:
        conexion.close()
