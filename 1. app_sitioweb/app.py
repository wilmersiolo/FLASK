from flask import Flask, render_template
from flask_bootstrap import Bootstrap

app = Flask(__name__)
Bootstrap(app)

@app.route("/")
def inicio():
    return render_template("index.html")

@app.route("/nuestra_marca")
def Nuestra_marca():
    return render_template("nuestra_marca.html")

@app.route("/productos")
def Productos():
    return render_template("productos.html")

@app.route("/promociones")
def Promociones():
    return render_template("promociones.html")

@app.route("/contacto")
def Contacto():
    return render_template("contacto.html")

if __name__ == "__main__":
    app.run(debug=True)
