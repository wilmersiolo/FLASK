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
                "INSERT INTO ingredientes (nombre, unidad_medida, precio_por_unidad, idProveedor, fecha_compra, fecha_caducidad) VALUES (%s, %s, %s, %s, %s, %s)",
                (nombreIngrediente, unidadMedidaIngrediente, PrecioIngrediente, proveedorIngrediente, fechaCompraIngrediente, fechaCaducidadIngrediente)
            )
            conexion.commit()
            return jsonify({"mensaje": "Ingrediente registrado exitosamente"}), 201
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()


def obtener_ingredientes():
    try:
        with obtener_conexion() as conexion, conexion.cursor() as cursor:
            query = """
                SELECT 
                    i.idIngrediente, 
                    i.nombre, 
                    i.unidad_medida, 
                    i.precio_por_unidad, 
                    i.idProveedor, 
                    p.nombre AS nombre_proveedor, 
                    i.fecha_compra, 
                    i.fecha_caducidad
                FROM ingredientes i
                LEFT JOIN proveedores p ON i.idProveedor = p.idProveedor;

            """
            cursor.execute(query)
            ingredientes = cursor.fetchall()

            ingredientes_lista = [{
                "idIngrediente": ingrediente[0],
                "nombre": ingrediente[1],
                "unidad_medida": ingrediente[2],
                "precio_por_unidad": float(ingrediente[3]) if ingrediente[3] is not None else 0.0,
                "idProveedor": ingrediente[4],
                "nombre_proveedor": ingrediente[5],
                "fecha_compra": ingrediente[6].strftime('%Y-%m-%d') if ingrediente[6] else None,
                "fecha_caducidad": ingrediente[7].strftime('%Y-%m-%d') if ingrediente[7] else None
            } for ingrediente in ingredientes]

            return jsonify(ingredientes_lista)

    except Exception as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500

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
            SET nombre = %s, unidad_medida = %s, precio_por_unidad = %s, idProveedor = %s, fecha_compra = %s, fecha_caducidad = %s
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

        
def buscar_ingrediente():
    termino = request.args.get("search", "").strip()

    if not termino:
        return jsonify({"error": "Debe proporcionar un término de búsqueda"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            query = """
                SELECT idIngrediente, nombre, unidad_medida
                FROM ingredientes 
                WHERE nombre LIKE %s 
                OR unidad_medida LIKE %s 
                OR idProveedor LIKE %s
            """
            like_term = f"%{termino}%"
            cursor.execute(query, (like_term, like_term, like_term))
            resultados = cursor.fetchall()

            ingredientes = [{"id": row[0], "nombre": row[1], "unidadMedida": row[2]} for row in resultados]

        return jsonify(ingredientes)

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()
     
def buscar_ingrediente_by_id():
    id_producto = request.args.get("id", "").strip()

    if not id_producto:
        return jsonify({"error": "Debe proporcionar un ID de producto"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            query = """
                SELECT pi.idIngrediente, i.nombre, pi.cantidadNecesaria, i.unidad_medida
                FROM productos_ingredientes pi
                JOIN ingredientes i ON pi.idIngrediente = i.idIngrediente
                WHERE pi.idProducto = %s
            """
            cursor.execute(query, (id_producto,))
            resultados = cursor.fetchall()

            ingredientes = [{"id": row[0], "nombre": row[1], "cantidad": row[2], "unidadMedida": row[3]} for row in resultados]

        return jsonify(ingredientes)

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()
