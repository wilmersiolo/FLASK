# Importamos las clases y métodos
from flask import Flask, render_template, redirect, request
from flask_bootstrap import Bootstrap

app = Flask(__name__)
Bootstrap(app)

@app.route('/', methods=['GET', "POST"])
def aritmetica():
    if request.method == "POST":
        # Valores que recibo del form n1, n2 son pasados
        num1 = float(request.form.get('n1'))
        num2 = float(request.form.get('n2'))
        # Realizamos operaciones aritméticas
        suma = num1 + num2
        resta = num1 - num2
        multiplicacion = num1 * num2
        division = num1 / num2
        return render_template('index.html', total_suma=suma, 
                                             total_resta=resta,
                                             total_multiplicacion=multiplicacion,
                                             total_division=division)

    return render_template('index.html')

def divisas(monto):
    tasa_usd_a_cop = 4382
    return monto * tasa_usd_a_cop

@app.route('/divisas', methods=['GET', 'POST'])
def conversor_divisas():
    resultado = None  
    if request.method == 'POST':
        monto_str = request.form.get('monto')
        
        if monto_str:
            monto = float(monto_str)
            resultado = divisas(monto)
    
    return render_template('divisas.html', resultado_conversion=resultado)




if __name__ == "__main__":
    app.run(debug=True)

