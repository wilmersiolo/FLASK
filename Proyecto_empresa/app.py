import os
from functools import wraps
from flask import Flask, render_template, session, url_for, redirect
from controllers.producto_controller import obtener_productos, editar_producto, cambiarEstado, registrarProducto
from controllers.ingrediente_controller import registrarIngrediente, obtener_ingredientes, editar_ingrediente
from controllers.usuario_controller import registrar_usuario, validar_login

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
    return render_template("dashboard.html", nombre=session["nombre"])

@app.route("/login")
def login():
    if "usuario_id" in session:
        return redirect(url_for("dashboard"))
    return render_template("login.html")

@app.route("/productos")
@login_required
def productos():
    return render_template("productos.html", nombre=session["nombre"])

@app.route("/ingredientes")
@login_required
def ingredientes():
    return render_template("ingredientes.html", nombre=session["nombre"])

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

#endregion

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8000, debug=True)
