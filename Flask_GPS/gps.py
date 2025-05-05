from flask import Flask, request, render_template, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 인증서 파일 경로
CERT_FILE = 'certs/inhamap.n-e.kr-crt.pem'
KEY_FILE = 'certs/inhamap.n-e.kr-key.pem'

gps_data = {"latitude": None, "longitude": None, "snr": None}

@app.route('/')
def index():
    return render_template('gnss.html')

@app.route('/gps', methods=['POST'])
def receive_gps():
    global gps_data
    data = request.get_json()
    gps_data.update({
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "snr": data.get("snr")
    })
    print("GPS 수신됨:", gps_data)
    return jsonify({"status": "success", "received": gps_data})

@app.route('/gps', methods=['GET'])
def get_gps():
    if gps_data["latitude"] is None or gps_data["longitude"] is None:
        return jsonify({"status": "error", "message": "GPS 연결되지 않음"}), 400
    return jsonify({"status": "success", **gps_data})

# 인증서 기반 HTTPS 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=443, ssl_context=(CERT_FILE, KEY_FILE))
