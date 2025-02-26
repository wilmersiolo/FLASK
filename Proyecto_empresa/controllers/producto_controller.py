from flask import request, jsonify, current_app
import pymysql
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

    if not idProducto or not titulo or not descripcion or not precioVenta or not precioProduccion:
        return jsonify({"error": "Faltan datos obligatorios"}), 400

    try:
        with conexion.cursor() as cursor:
            # Obtener la imagen actual del producto
            cursor.execute("SELECT img FROM productos WHERE idProducto = %s", (idProducto,))
            producto = cursor.fetchone()
            imagen_actual = producto[0] if producto else None  # Accede a la primera posición de la tupla


            # Si hay nueva imagen, reemplazar la anterior
            if nueva_imagen and allowed_file(nueva_imagen.filename):
                filename = secure_filename(nueva_imagen.filename)
                filepath = os.path.join(current_app.config["UPLOAD_FOLDER"], filename)

                # Eliminar la imagen anterior si existe
                if imagen_actual:
                    imagen_antigua_path = os.path.join(imagen_actual)
                    if os.path.exists(imagen_antigua_path):
                        os.remove(imagen_antigua_path)

                # Guardar la nueva imagen
                nueva_imagen.save(filepath)
                nueva_imagen_nombre = filepath.replace("\\", "/")
            else:
                nueva_imagen_nombre = imagen_actual  # Mantener la imagen anterior si no hay nueva

            # Actualizar los datos del producto
            query = """
                UPDATE productos 
                SET titulo = %s, descripcion = %s, precioVenta = %s, 
                    precioProduccion = %s, oferta = %s, precioOferta = %s, fechaCreat = %s, img = %s
                WHERE idProducto = %s
            """
            values = [titulo, descripcion, precioVenta, precioProduccion, oferta, precioOferta, fechaCreacion, nueva_imagen_nombre, idProducto]
            
            cursor.execute(query, tuple(values))
            conexion.commit()

        return jsonify({"success": True, "message": "Producto actualizado correctamente"})

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



def registrarProducto():
    if "imagenProducto" not in request.files:
        return jsonify({"error": "No se envió ninguna imagen"}), 400

    file = request.files["imagenProducto"]

    if file.filename == "":
        return jsonify({"error": "Nombre de archivo vacío"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)  # Evita problemas con nombres de archivos
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # Guardar la imagen en el directorio correcto
        file.save(filepath)

        # Guardar solo la ruta relativa
        imagenProducto = f"{UPLOAD_FOLDER}/{filename}"
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

    if not tituloProducto or not precioVenta or not precioProduccion or not descripcionProducto or not ofertaProducto or not estadoProducto:
        return jsonify({"error": "Faltan datos requeridos"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            cursor.execute(
                "INSERT INTO productos (img, titulo, precioVenta, precioProduccion, descripcion, oferta, precioOferta, estado) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
                (imagenProducto, tituloProducto, precioVenta, precioProduccion, descripcionProducto, ofertaProducto, precioOferta, estadoProducto)
            )
            conexion.commit()
            return jsonify({"mensaje": "Producto registrado exitosamente"}), 201
    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()