"""
CRUD FLASK PYTHON + MYSQL
Desarrollado por: Eliseo Vega Alian
"""

# Realizamos la importación de la librería con pip install PyMySQL
import pymysql

# Configuramos los datos de conexión con la base de datos
def obtener_conexion():
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        db='app_crud_juego'
    )