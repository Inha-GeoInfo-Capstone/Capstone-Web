from flask import Flask, request, render_template, jsonify
from flask_cors import CORS
from flask import send_from_directory

app = Flask(__name__)
CORS(app)

@app.route('/.well-known/acme-challenge/<filename>')
def letsencrypt_challenge(filename):
    return send_from_directory('static/.well-known/acme-challenge', filename)

gps_data = {"latitude": None, "longitude": None, "snr": None}  # GPS + SNR 데이터 저장

@app.route('/')
def index():
    return render_template('test.html')  # templates 폴더에 index.html 파일 제공

@app.route('/gps', methods=['POST'])
def receive_gps():
    global gps_data
    data = request.get_json()
    
    gps_data["latitude"] = data.get("latitude")
    gps_data["longitude"] = data.get("longitude")
    gps_data["snr"] = data.get("snr")  # SNR 값 저장
    
    print(f"📌 새로운 GPS 데이터 수신: {gps_data}")
    return jsonify({"status": "success", "received": gps_data})

@app.route('/gps', methods=['GET'])
def get_gps():
    # GPS 데이터가 없을 경우 기본값을 반환하도록 설정 (디버깅용) 
    if gps_data["latitude"] is None or gps_data["longitude"] is None:
        return jsonify({"status": "error", "message": "GPS connect x "}), 400
    
    return jsonify({
        "status": "success",
        "latitude": gps_data["latitude"],
        "longitude": gps_data["longitude"],
        "snr": gps_data["snr"]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=443, ssl_context=(
        'C:\\Users\\seok6\\OneDrive\\Desktop\\demo\\src\\main\\resources\\inhamap.n-e.kr-crt.pem', 
        'C:\\Users\\seok6\\OneDrive\\Desktop\\demo\\src\\main\\resources\\inhamap.n-e.kr-key.pem'
    )) 