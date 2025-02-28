from flask import request, jsonify, current_app
import pymysql
import json
from bd import obtener_conexion
import os
from werkzeug.utils import secure_filename

# Carpeta de subida
UPLOAD_FOLDER = "static/img/productos"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

# Verifica si la extensión es válida
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def obtener_productos():
    conexion = obtener_conexion()
    productos_lista = []
    try:
        with conexion.cursor() as cursor:
            cursor.execute("SELECT * FROM productos")
            productos = cursor.fetchall()
            for producto in productos:
                productos_lista.append({
                    "idProducto": producto[0],
                    "titulo": producto[1],
                    "descripcion": producto[2],
                    "precioVenta": float(producto[3]),
                    "precioProduccion": float(producto[4]),
                    "oferta": bool(producto[5]),
                    "precioOferta": float(producto[6]),
                    "img": producto[7],
                    "estado": producto[8],
                    "fechaCreat": producto[9].strftime('%Y-%m-%d %H:%M:%S')
                })
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()
    return jsonify(productos_lista)


def editar_producto():
    conexion = obtener_conexion()
    nueva_imagen = request.files.get("nuevaImagen")  # Obtener imagen (si se envía)

    # Obtener datos del formulario
    idProducto = request.form.get("idProducto")
    titulo = request.form.get("titulo")
    descripcion = request.form.get("descripcion")
    precioVenta = request.form.get("precioVenta")
    precioProduccion = request.form.get("precioProduccion")
    oferta = request.form.get("oferta") == '1'
    precioOferta = request.form.get("precioOferta")
    fechaCreacion = request.form.get("fechaCreacion")
    ingredientes_json = request.form.get("ingredientes")  # Recibe JSON de ingredientes
    if not idProducto or not titulo or not descripcion or not precioVenta or not precioProduccion:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    try:
        with conexion.cursor() as cursor:
            # Obtener la imagen actual del producto
            cursor.execute("SELECT img FROM productos WHERE idProducto = %s", (idProducto,))
            producto = cursor.fetchone()
            imagen_actual = producto[0] if producto else None  # Accede a la primera posición de la tupla

            # Manejo de imagen
            nueva_imagen_nombre = imagen_actual  # Mantener la imagen anterior si no hay nueva
            if nueva_imagen and allowed_file(nueva_imagen.filename):
                filename = secure_filename(nueva_imagen.filename)
                filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)

                # Eliminar la imagen anterior si existe
                if imagen_actual:
                    imagen_antigua_path = os.path.join(current_app.config["UPLOAD_FOLDER"], imagen_actual)
                    if os.path.exists(imagen_antigua_path):
                        os.remove(imagen_antigua_path)

                # Guardar la nueva imagen
                nueva_imagen.save(filepath)
                nueva_imagen_nombre = filename  # Guardar solo el nombre del archivo

            # Actualizar los datos del producto
            query = """
                UPDATE productos 
                SET titulo = %s, descripcion = %s, precioVenta = %s, 
                    precioProduccion = %s, oferta = %s, precioOferta = %s, fechaCreat = %s, img = %s
                WHERE idProducto = %s
            """
            values = [titulo, descripcion, precioVenta, precioProduccion, oferta, precioOferta, fechaCreacion, nueva_imagen_nombre, idProducto]
            
            cursor.execute(query, tuple(values))

            # Si hay ingredientes, actualizar la tabla `productos_ingredientes`
            if ingredientes_json:
                ingredientes = json.loads(ingredientes_json)

                # Eliminar ingredientes existentes
                cursor.execute("DELETE FROM productos_ingredientes WHERE idProducto = %s", (idProducto,))

                # Insertar los nuevos ingredientes
                for ing in ingredientes:
                    query_ingrediente = """
                        INSERT INTO productos_ingredientes (idProducto, idIngrediente, cantidadNecesaria)
                        VALUES (%s, %s, %s)
                    """
                    cursor.execute(query_ingrediente, (idProducto, ing["id"], ing["cantidad"]))

            conexion.commit()

        return jsonify({"success": True, "message": "Producto actualizado correctamente"})

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    except json.JSONDecodeError:
        return jsonify({"error": "Formato de ingredientes inválido"}), 400
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


def registrarProducto():
    # Verificar que se envió la imagen
    if "imagenProducto" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400

    file = request.files["imagenProducto"]
    if file.filename == "":
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    # Validar imagen y guardar en servidor
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        imagenProducto = f"{UPLOAD_FOLDER}/{filename}"  # Ruta relativa
    else:
        return jsonify({"error": "Formato de imagen no permitido"}), 400

    # Obtener otros datos del formulario
    tituloProducto = request.form.get("tituloProducto")
    precioVenta = request.form.get("precioVenta")
    precioProduccion = request.form.get("precioProduccion")
    descripcionProducto = request.form.get("descripcionProducto")
    ofertaProducto = request.form.get("ofertaProducto")
    precioOferta = request.form.get("precioOferta")
    estadoProducto = request.form.get("estadoProducto")

    # Validar que no falten datos
    if not tituloProducto or not precioVenta or not precioProduccion or not descripcionProducto or not ofertaProducto or not estadoProducto:
        return jsonify({"error": "Faltan datos requeridos"}), 400

    # Convertir ingredientes a lista de diccionarios
    try:
        ingredientes_json = request.form.get("ingredientes", "[]")  # Recibe como string
        ingredientes = json.loads(ingredientes_json) if ingredientes_json else []
        
        if not all("id" in ing and "cantidad" in ing for ing in ingredientes):
            return jsonify({"error": "Cada ingrediente debe contener 'id' y 'cantidad'."}), 400
    except json.JSONDecodeError:
        return jsonify({"error": "Formato de ingredientes inválido"}), 400


    # Insertar en la base de datos
    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            # Insertar producto
            cursor.execute(
                "INSERT INTO productos (img, titulo, precioVenta, precioProduccion, descripcion, oferta, precioOferta, estado) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (imagenProducto, tituloProducto, precioVenta, precioProduccion, descripcionProducto, ofertaProducto, precioOferta, estadoProducto)
            )
            idProducto = cursor.lastrowid  # Obtener el ID generado

            # Insertar ingredientes si hay
            if ingredientes:
                query_ingredientes = "INSERT INTO productos_ingredientes (idProducto, idIngrediente, cantidadNecesaria) VALUES (%s, %s, %s)"
                valores_ingredientes = [(idProducto, ing["id"], ing["cantidad"]) for ing in ingredientes]
                cursor.executemany(query_ingredientes, valores_ingredientes)

            conexion.commit()
            return jsonify({"mensaje": "Producto registrado exitosamente"}), 201
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()