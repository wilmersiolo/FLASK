""""
Proyecto Empresa
Desarrollado por: Alejandro Jose Cossi Melendez
"""

#Realizamos la importancia de la libreria con pip install pyMySQL
import pymysql

#Congiguramos los datos de conexion con la base de datos
def obtener_conexion():
    return pymysql.connect(host='localhost',
                                user='root',
                                password='',
                                db='sistema_pedidos')