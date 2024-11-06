# Se importa el módulo Flask desde el paquete flask
from flask import Flask
"""
Ejercicio 1: Crea una aplicación web básica con Flask que,
al ser ejecutada, inicia un servidor local en el puerto 5000.
Cuando visita la ruta principal (http://localhost:5000/),
el servidor responderá con un mensaje HTML que dice "Hello, World Flask".
"""
# Crea una instancia de la clase Flask.
# El argumento _name_ le dice a Flask
# que utilice el nombre del archivo actual main.py
app = Flask(__name__)

# Este es un decorador que define una ruta
# que corresponde a la página principal del app
@app.route("/")
# Cuando alguien visite app (por ejemplo, http://localhost:5000/),
# la función hello() será ejecutada
def hello():
    return "<h1>Hello, World Flask!</h1>"

# Solo se ejecuta si el archivo es ejecutado directamente
# arranca la aplicación Flask en modo de depuración (debug=True)
if __name__ == "__main__":
    app.run(debug=True, port=5000)