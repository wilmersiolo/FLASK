from flask import request, jsonify
from werkzeug.security import generate_password_hash
import pymysql
from bd import obtener_conexion
import re

def validar_email(email):
    """Verifica si el email tiene un formato válido."""
    patron = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(patron, email) is not None

def registrarEmpleado():
    """Registra un nuevo empleado en la base de datos."""
    # Obtener datos del formulario
    nombre = request.form.get("nombreEmpleado")
    apellido = request.form.get("apellidoEmpleado")
    email = request.form.get("emailEmpleado")
    telefono = request.form.get("telefonoEmpleado")
    direccion = request.form.get("direccionEmpleado")
    ciudad = request.form.get("ciudadEmpleado")
    departamento = request.form.get("departamentoEmpleado")
    codigo_postal = request.form.get("codigoPostalEmpleado")
    pais = request.form.get("paisEmpleado")
    id_sucursal = request.form.get("idSucursalEmpleado")
    cargo = request.form.get("cargoEmpleado")
    fecha_contratacion = request.form.get("fechaContratacionEmpleado")
    password = request.form.get("passwordEmpleado")
    salario = request.form.get("salarioEmpleado")
    activo = request.form.get("activoEmpleado")

    print("Datos", nombre, apellido, email, telefono, direccion 
           , codigo_postal, id_sucursal, cargo, fecha_contratacion, password, salario)
    # Validar datos requeridos
    if not (nombre and apellido and email and telefono and direccion 
            and codigo_postal and id_sucursal and cargo and fecha_contratacion and password and salario):
        return jsonify({"error": "Faltan datos requeridos"}), 400

    # Validar formato de email
    if not validar_email(email):
        return jsonify({"error": "Formato de email inválido"}), 400

    # Validar el campo activo (0 o 1)
    if activo not in ["0", "1"]:
        return jsonify({"error": "Valor inválido para el campo 'activo'"}), 400

    conexion = obtener_conexion()
    try:
        with conexion.cursor() as cursor:
            # Verificar si el email ya está registrado
            cursor.execute("SELECT idEmpleado FROM empleados WHERE email = %s", (email,))
            empleado_existente = cursor.fetchone()
            if empleado_existente:
                return jsonify({"error": "El email ya está registrado"}), 400
            

            password_hash = generate_password_hash(password)


            cursor.execute(
                """
                INSERT INTO usuarios (email, password, rol, activo) 
                VALUES (%s, %s, %s, %s)
                """,
                (email, password_hash, cargo, int(activo))
            )

            cursor.execute("SELECT idUsuario FROM usuarios WHERE email = %s", (email,))
            idUsuarioCreate = cursor.fetchone()
            # Insertar nuevo empleado
            cursor.execute(
                """
                INSERT INTO empleados (idUsuario, nombres, apellidos, email, telefono, direccion, ciudad, departamento, 
                                       codigo_postal, pais, idSucursal, cargo, fecha_contratacion, salario, activo) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (idUsuarioCreate, nombre, apellido, email, telefono, direccion, ciudad, departamento, codigo_postal, pais, 
                 id_sucursal, cargo, fecha_contratacion, salario, int(activo))
            )
            conexion.commit()
            return jsonify({"mensaje": "Empleado registrado exitosamente"}), 201

    except pymysql.MySQLError as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500
    finally:
        conexion.close()


def obtenerEmpleados():
    """Obtiene la lista de empleados desde la base de datos con el nombre de la sucursal."""
    try:
        with obtener_conexion() as conexion, conexion.cursor() as cursor:
            query = """
                SELECT e.idEmpleado, e.idUsuario, e.idSucursal, e.nombres, e.apellidos, e.email, e.telefono, 
                       e.cargo, e.salario, e.fecha_contratacion, e.activo, e.direccion, e.ciudad, e.departamento, 
                       e.codigo_postal, e.pais, e.fecha_creacion, e.fecha_actualizacion, s.nombre AS sucursal_nombre
                FROM empleados e
                JOIN sucursales s ON e.idSucursal = s.id
            """
            cursor.execute(query)
            empleados = cursor.fetchall()

            empleados_lista = [{
                "idEmpleado": emp[0],
                "idUsuario": emp[1],
                "idSucursal": emp[2],
                "nombres": emp[3],
                "apellidos": emp[4],
                "email": emp[5],
                "telefono": emp[6],
                "cargo": emp[7],
                "salario": emp[8],
                "fecha_contratacion": emp[9],
                "activo": emp[10],
                "direccion": emp[11],
                "ciudad": emp[12],
                "departamento": emp[13],
                "codigo_postal": emp[14],
                "pais": emp[15],
                "fecha_creacion": emp[16],
                "fecha_actualizacion": emp[17],
                "sucursal_nombre": emp[18]
            } for emp in empleados]

            return jsonify(empleados_lista), 200  # ✅ Respuesta válida para Flask

    except Exception as e:
        return jsonify({"error": f"Error en la base de datos: {str(e)}"}), 500