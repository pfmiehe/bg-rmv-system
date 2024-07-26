from flask import Blueprint, request, jsonify, send_file, current_app
import os
from werkzeug.utils import secure_filename
from flask_cors import cross_origin
import cv2
import numpy as np
from cvzone.SelfiSegmentationModule import SelfiSegmentation

main = Blueprint('main', __name__)

segmentor = SelfiSegmentation()

@main.route('/')
@cross_origin()
def home():
    return "Flask is running!"

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@main.route('/upload', methods=['POST'])
@cross_origin()
def upload_file():
    if 'file' not in request.files:
        return jsonify(error='No file part'), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify(error='No selected file'), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Mover a imagem original para o diretório de processados
        processed_path = os.path.join(current_app.config['PROCESSED_FOLDER'], filename)
        os.rename(file_path, processed_path)
        return jsonify(filename=filename), 200
    return jsonify(error='File not allowed'), 400

@main.route('/processed/<filename>')
@cross_origin()
def get_processed_file(filename):
    processed_folder = os.path.abspath(current_app.config['PROCESSED_FOLDER'])
    file_path = os.path.join(processed_folder, filename)
    if os.path.exists(file_path):
        return send_file(file_path)
    return jsonify(error='File not found'), 404

@main.route('/process', methods=['POST'])
@cross_origin()
def process_image():
    data = request.get_json()
    points = data['points']
    image_url = data['imageUrl']

    # Extrair o nome do arquivo da URL da imagem
    filename = image_url.split('/')[-1]
    processed_folder = os.path.abspath(current_app.config['PROCESSED_FOLDER'])
    file_path = os.path.join(processed_folder, filename)

    # Carregar a imagem
    image = cv2.imread(file_path, cv2.IMREAD_UNCHANGED)
    if image is None:
        return jsonify(error='Image not found'), 404
    
    # Garantir que a imagem tem 4 canais
    if image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2BGRA)

    # Aplicar SelfiSegmentation para remover o background
    img_no_bg = segmentor.removeBG(image, (0, 255, 0))

    # Converter a imagem para RGBA 
    img_no_bg = cv2.cvtColor(img_no_bg, cv2.COLOR_BGR2BGRA)

    # Criar máscara para background verde
    lower_green = np.array([0, 255, 0, 255])
    upper_green = np.array([0, 255, 0, 255])
    green_mask = cv2.inRange(img_no_bg, lower_green, upper_green)

    # Setar áreas verdes para transparente
    kernel = np.ones((3, 3), np.uint8)
    green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_OPEN, kernel, iterations=2)
    green_mask = cv2.morphologyEx(green_mask, cv2.MORPH_DILATE, kernel, iterations=1)

    img_no_bg[green_mask == 255] = (0, 0, 0, 0)
 
    # Salvar imagem processada
    processed_path = os.path.join(processed_folder, f'processed_{filename}')
    cv2.imwrite(processed_path, img_no_bg, [cv2.IMWRITE_PNG_COMPRESSION, 9])

    return jsonify(filename=f'processed_{filename}'), 200

@main.route('/visualcenter', methods=['POST'])
@cross_origin()
def center_image():
    data = request.get_json()
    image_url = data['imageUrl']

    # Extrair o nome do arquivo da URL da imagem
    filename = image_url.split('/')[-1]
    processed_folder = os.path.abspath(current_app.config['PROCESSED_FOLDER'])
    file_path = os.path.join(processed_folder, filename)

    # Carregar imagem
    image = cv2.imread(file_path, cv2.IMREAD_UNCHANGED)
    if image is None:
        return jsonify(error='Image not found'), 404

    # Converter para escala de cinza 
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Calcular momentos d imagem
    moments = cv2.moments(gray)
    
    # Calcular X e Y do centro
    if moments["m00"] != 0:
        center_x = int(moments["m10"] / moments["m00"])
        center_y = int(moments["m01"] / moments["m00"])
    else:
        center_x, center_y = gray.shape[1] // 2, gray.shape[0] // 2

    # Calcular movimento necessário para mover a imagem para o centro visual
    height, width = gray.shape
    translation_x = width // 2 - center_x
    translation_y = height // 2 - center_y

    # Criar matriz de movimento e aplica-la
    translation_matrix = np.float32([[1, 0, translation_x], [0, 1, translation_y]])
    centered_image = cv2.warpAffine(image, translation_matrix, (width, height))

    # Salvar imagem centralizada
    centered_path = os.path.join(processed_folder, f'centered_{filename}')
    cv2.imwrite(centered_path, centered_image)

    return jsonify(filename=f'centered_{filename}'), 200
