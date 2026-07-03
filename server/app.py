import base64
import io
import os
try:
    from dotenv import load_dotenv
    _HAS_DOTENV = True
except ImportError:
    _HAS_DOTENV = False
    load_dotenv = None

import cv2
import numpy as np
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from PIL import Image
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load .env config file
dotenv_path = os.path.join(BASE_DIR, ".env")
if os.path.isfile(dotenv_path):
    if _HAS_DOTENV:
        load_dotenv(dotenv_path)
        print("Loaded config: .env")
    else:
        print("Note: .env file found but python-dotenv not installed")
        print("      Using environment variables or defaults")
else:
    print("Tip: .env not found, using defaults")
    print("      Copy .env.template to .env to customize")

MODEL_PATH = os.environ.get('EGG_MODEL_PATH', os.path.join(BASE_DIR, 'models', 'best.pt'))
DEFAULT_CONF = float(os.environ.get('EGG_CONF', '0.65'))

model = None


def get_model():
    global model
    if model is None:
        if not os.path.isfile(MODEL_PATH):
            raise FileNotFoundError(f'Model file not found:  {MODEL_PATH}')
        model = YOLO(MODEL_PATH)
    return model


def level_from_detections(detections):
    if not detections:
        return 'good', '合格'
    labels = [d['class'] for d in detections]
    joined = ' '.join(labels)
    if any(k in joined for k in ('破损', '裂纹', '重度', 'danger', 'broken', 'crack')):
        return 'danger', '重度缺损'
    if any(k in joined for k in ('污损', '污渍', '脏污', '暗斑', 'stain', 'dirty')):
        return 'normal', '轻度污损'
    return 'normal', '需复核'


@app.route('/api/health', methods=['GET'])
def health():
    exists = os.path.isfile(MODEL_PATH)
    return jsonify({
        'status': 'ok' if exists else 'no_model',
        'model': os.path.basename(MODEL_PATH),
        'model_path': MODEL_PATH,
        'model_exists': exists,
    })


@app.route('/api/detect', methods=['POST'])
def detect():
    try:
        yolo = get_model()
    except FileNotFoundError as e:
        return jsonify({'success': False, 'error': str(e)}), 503

    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'Please upload an image file'}), 400

        file = request.files['file']
        if not file.filename:
            return jsonify({'success': False, 'error': 'The file name is empty'}), 400

        conf = float(request.form.get('conf', DEFAULT_CONF))
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_array = np.array(image)
        img_cv = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        results = yolo.predict(img_cv, conf=conf, imgsz=640, verbose=False)
        detections = []

        if results and len(results) > 0:
            result = results[0]
            names = result.names or {}
            for box in result.boxes:
                cls_id = int(box.cls[0].cpu().numpy())
                score = float(box.conf[0].cpu().numpy())
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                detections.append({
                    'class_id': cls_id,
                    'class': names.get(cls_id, str(cls_id)),
                    'confidence': round(score, 4),
                    'bbox': {
                        'x1': round(float(x1), 1),
                        'y1': round(float(y1), 1),
                        'x2': round(float(x2), 1),
                        'y2': round(float(y2), 1),
                    },
                })

        level, result_text = level_from_detections(detections)
        summary = f'A total of {len(detections)} targets were detected' if detections else 'No obvious defects were detected.'

        annotated_b64 = None
        if results and len(results) > 0:
            plotted = results[0].plot()
            ok, buffer = cv2.imencode('.jpg', plotted)
            if ok:
                annotated_b64 = 'data:image/jpeg;base64,' + base64.b64encode(buffer).decode()

        return jsonify({
            'success': True,
            'summary': summary,
            'result': result_text,
            'level': level,
            'detections': detections,
            'image': annotated_b64,
            'model': os.path.basename(MODEL_PATH),
        })
    except Exception as e:
        return jsonify({'success': False, 'error': f'Test Failed： {e}'}), 500



@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f'Egg Testing Service Launched: http://0.0.0.0:{port}')
    print(f'模型路径: {MODEL_PATH}')
    if os.path.isfile(MODEL_PATH):
        get_model()
        print('模型加载成功')
    else:
        print('警告: 模型文件不存在，请将 best.pt 放到 server/models/ 目录')
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() in ('true', '1', 'yes')
    app.run(host='0.0.0.0', port=port, debug=debug)


