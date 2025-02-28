from flask import request, jsonify, current_app
import pymysql
from bd import obtener_conexion
import os
from werkzeug.utils import secure_filename

def obtener_proveedores():
    try:
        with obtener_conexion() as conexion, conexion.cursor() as cursor:
            query = """
                SELECT * FROM proveedores

            """
            cursor.execute(query)
            proveedores = cursor.fetchall()
            proveedores_lista = [{
                "idProveedor": proveedores[0],
                "nombre": proveedores[1],
                "contacto": proveedores[2],
                "telefono": proveedores[3],
                "email": proveedores[4],
                "direccion": proveedores[5]
            } for proveedores in proveedores]

            return jsonify(proveedores_lista)

    except Exception as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
