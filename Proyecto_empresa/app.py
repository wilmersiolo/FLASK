import os
from functools import wraps
from flask import Flask, render_template, session, url_for, redirect
from controllers.producto_controller import obtener_productos, editar_producto, cambiarEstado, registrarProducto
from controllers.ingrediente_controller import registrarIngrediente, obtener_ingredientes, editar_ingrediente, buscar_ingrediente, buscar_ingrediente_by_id
from controllers.usuario_controller import registrar_usuario, validar_login
from controllers.proveedores_controller import obtener_proveedores
from controllers.cliente_controller import registrarCliente, obtenerClientes, updateCliente
from controllers.sucursal_controller import registrarSucursal, obtenerSucursales, updateSucursal
from controllers.empleado_controller import registrarEmpleado, obtenerEmpleados

# Iniciamos la aplicación Flask
app = Flask(__name__)
app.secret_key = "15306266"

UPLOAD_FOLDER = "static/img/productos"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Asegurar que la carpeta de imágenes existe
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


#region Login

# Decorador para verificar sesión activa
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "usuario_id" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/registrarUsuario", methods=["POST"])
def registrar():
    return registrar_usuario()

@app.route("/validarLogin", methods=["POST"])
def validar():
    return validar_login()

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

#endregion

#region RutasAplicación
@app.route("/")
@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/dashboard")
@login_required
def dashboard():
    if session.get("rol") != "Super Admin":
        return redirect(url_for("login"))
    return render_template("dashboard.html", rol=session["rol"])

@app.route("/login")
def login():
    rol = session.get("rol")
    match rol:
        case "Super Admin":
            return redirect(url_for(dashboard))
        case "Sucursal":
            return redirect(url_for("sucursal_dashboard"))
        case _:
            return render_template("login.html")
    

@app.route("/productos")
@login_required
def productos():
    return render_template("productos.html", idUsuario=session["usuario_id"])

@app.route("/clientes")
@login_required
def clientes():
    return render_template("clientes.html", idUsuario=session["usuario_id"])

@app.route("/ingredientes")
@login_required
def ingredientes():
    return render_template("ingredientes.html", idUsuario=session["usuario_id"])

@app.route("/sucursales")
@login_required
def sucursales():
    return render_template("sucursales.html", idUsuario=session["usuario_id"])

@app.route("/empleados")
@login_required
def empleados():
    return render_template("empleados.html", idUsuario=session["usuario_id"])

#endregion

#region Api'sProductos
@app.route("/registrarProducto", methods=["POST"])
def registrarProducto_route():
    return registrarProducto()

@app.route("/getProductos")
def getProductos():
    return obtener_productos()

@app.route("/updateProducto", methods=["POST"])
@login_required
def editar_producto_route():
    return editar_producto()

@app.route("/cambiarEstado", methods=["POST"])
@login_required
def cambiarEstadoRoute():
    return cambiarEstado()

#endregion

#region Api'sIngredientes
@app.route("/registrarIngrediente", methods=["POST"])
def registrarIngrediente_route():
    return registrarIngrediente()

@app.route("/getIngredientes")
def getIngredientes():
    return obtener_ingredientes()

@app.route("/updateIngrediente", methods=["POST"])
@login_required
def editar_ingrediente_route():
    return editar_ingrediente()

@app.route("/getIngrediente")
@login_required
def get_ingrediente():
    return buscar_ingrediente()

@app.route("/getIngredientesProducto", methods=["GET"])
@login_required
def get_ingrediente_by_id_route():
    return buscar_ingrediente_by_id()
#endregion

#region Proveedores Api's
@app.route("/getProveedores")
@login_required
def get_proveedores_rounte():
    return obtener_proveedores()

#endregion
#region Clientes Api's
@app.route("/registrarCliente", methods=["POST"])
@login_required
def registrar_cliente_route():
    return registrarCliente()

@app.route("/obtenerClientes")
@login_required
def obtener_clientes_route():
    return obtenerClientes()

@app.route("/updateCliente", methods=["POST"])
@login_required
def update_cliente_route():
    return updateCliente()

#endregion

#region Sucursales Api's
@app.route("/registrarSucursal", methods=["POST"])
@login_required
def registrar_sucursal_route():
    return registrarSucursal()

@app.route("/obtenerSucursales")
@login_required
def obtener_sucursales_route():
    return obtenerSucursales()

@app.route("/updateSucursal", methods=["POST"])
@login_required
def update_sucursal_route():
    return updateSucursal()

#endregion
#region Empleados Api's
@app.route("/registrarEmpleado", methods=["POST"])
@login_required
def registrar_empleado_route():
    return registrarEmpleado()

@app.route("/obtenerEmpleados")
@login_required
def obtener_empleado_route():
    return obtenerEmpleados()
#endregion
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
