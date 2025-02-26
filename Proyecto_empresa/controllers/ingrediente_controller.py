from flask import request, jsonify, current_app
import pymysql
from bd import obtener_conexion
import os
from werkzeug.utils import secure_filename

def registrarIngrediente():
    # Obtener otros datos del formulario
    nombreIngrediente = request.form.get("nombreIngrediente")
    unidadMedidaIngrediente = request.form.get("unidadMedidaIngrediente")
    PrecioIngrediente = request.form.get("PrecioIngrediente")
    proveedorIngrediente = request.form.get("proveedorIngrediente")
    fechaCompraIngrediente = request.form.get("fechaCompraIngrediente")
    fechaCaducidadIngrediente = request.form.get("fechaCaducidadIngrediente")


    if not nombreIngrediente or not unidadMedidaIngrediente or not PrecioIngrediente or not proveedorIngrediente or not fechaCompraIngrediente or not fechaCaducidadIngrediente:
        return jsonify({"error": "Faltan datos requeridos"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                "INSERT INTO ingredientes (nombre, unidad_medida, precio_por_unidad, proveedor, fecha_compra, fecha_caducidad) VALUES (%s, %s, %s, %s, %s, %s)",
                (nombreIngrediente, unidadMedidaIngrediente, PrecioIngrediente, proveedorIngrediente, fechaCompraIngrediente, fechaCaducidadIngrediente)
            )
            conexion.commit()
            return jsonify({"mensaje": "Ingrediente registrado exitosamente"}), 201
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()


def obtener_ingredientes():
    conexion = obtener_conexion()
    ingredientes_lista = []
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM ingredientes")
            ingredientes = cursor.fetchall()
            for ingrediente in ingredientes:
                ingredientes_lista.append({
                    "idIngrediente": ingrediente[0],
                    "nombre": ingrediente[1],
                    "unidad_medida": ingrediente[2],
                    "precio_por_unidad": float(ingrediente[3]),
                    "proveedor": ingrediente[4],
                    "fecha_compra": ingrediente[5].strftime('%Y-%m-%d'),
                    "fecha_caducidad": ingrediente[6].strftime('%Y-%m-%d')
                })
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()
    return jsonify(ingredientes_lista)


def editar_ingrediente():
    conexion = obtener_conexion()

    try:
        data = request.json  # <-- Cambia a request.json

        # Obtener datos del formulario
        idIngrediente = data.get("idIngrediente")
        nombre = data.get("nombre")
        unidadMedida = data.get("unidadMedida")
        precio = data.get("precio")
        proveedor = data.get("proveedor")
        fechaCompra = data.get("fechaCompra")
        fechaCaducidad = data.get("fechaCaducidad")

        

        if not idIngrediente or not nombre or not unidadMedida or not precio or not proveedor or not fechaCompra or not fechaCaducidad:
            return jsonify({
                "error": "Faltan datos obligatorios",
                "datos_recibidos": {
                    "idIngrediente": idIngrediente,
                    "nombre": nombre,
                    "unidadMedida": unidadMedida,
                    "precio": precio,
                    "proveedor": proveedor,
                    "fechaCompra": fechaCompra,
                    "fechaCaducidad": fechaCaducidad
                }
            }), 400


        query = """
            UPDATE ingredientes 
            SET nombre = %s, unidad_medida = %s, precio_por_unidad = %s, proveedor = %s, fecha_compra = %s, fecha_caducidad = %s
        """
        

        values = [nombre, unidadMedida, precio, proveedor, fechaCompra, fechaCaducidad]

        query += " WHERE idIngrediente = %s"
        values.append(idIngrediente)

        with conexion.cursor() as cursor:
            cursor.execute(query, tuple(values))

        conexion.commit()
        return jsonify({"success": True})

    except pymysql.MySQLError as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conexion.close()

        
def cambiarEstado():
    """Ruta para cambiar el estado de un producto en la base de datos."""
    
    conexion = obtener_conexion()

    try:
        data = request.get_json()  # Obtener datos enviados desde JS
        id_producto = data.get("idProducto")
        nuevo_estado = data.get("nuevoEstado")  # Recibir el nuevo estado

        if not id_producto or not nuevo_estado:
            return jsonify({"success": False, "error": "Datos insuficientes"}), 400

        query = "UPDATE productos SET estado = %s WHERE idProducto = %s"

        with conexion.cursor() as cursor:
            cursor.execute(query, (nuevo_estado, id_producto))
        
        conexion.commit()
        return jsonify({"success": True, "nuevoEstado": nuevo_estado})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

    finally:
        if conexion:
            conexion.close()

