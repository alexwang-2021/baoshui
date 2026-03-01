#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""企业记账报税 - 后端 API（登录/验证码）"""
import os
import re
import random
import string
import time
import hashlib
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_folder='.', static_url_path='')

# 内存存储验证码（生产环境应使用 Redis 等）
_sms_codes = {}  # {phone: (code, expires_at)}
TOKEN_SECRET = os.environ.get('BAOSHUI_SECRET', 'baoshui-dev-secret')


def _normalize_phone(raw):
    raw = (raw or '').strip().replace(' ', '').replace('-', '')
    if raw.startswith('+86'):
        raw = raw[3:].strip()
    return raw if re.match(r'^1[3-9]\d{9}$', raw) else None


@app.route('/api/sms/send', methods=['POST'])
def send_sms():
    """发送验证码"""
    data = request.get_json() or {}
    phone = _normalize_phone(data.get('phone', ''))
    if not phone:
        return jsonify({'code': 400, 'message': '手机号无效，请填写 11 位手机号'}), 400

    # 60 秒限频
    if phone in _sms_codes:
        _, exp = _sms_codes[phone]
        if time.time() < exp - 540:  # 60s 内
            return jsonify({'code': 400, 'message': '发送太频繁，请 60 秒后再试'}), 400

    code = ''.join(random.choices(string.digits, k=6))
    expires_at = time.time() + 600  # 10 分钟
    _sms_codes[phone] = (code, expires_at)

    # 开发环境：控制台输出
    app.logger.info('[sms] phone=%s*** code=%s', phone[:3], code)
    print('[baoshui] 验证码 %s*** -> %s' % (phone[:3], code))

    return jsonify({'code': 0, 'message': '验证码已发送'})


@app.route('/api/auth/login', methods=['POST'])
def login():
    """登录/注册"""
    data = request.get_json() or {}
    phone = _normalize_phone(data.get('phone', ''))
    code = (data.get('code') or '').strip()

    if not phone:
        return jsonify({'code': 400, 'message': '请输入 11 位手机号'}), 400
    if not code or not code.isdigit():
        return jsonify({'code': 400, 'message': '请输入验证码'}), 400

    if phone not in _sms_codes:
        return jsonify({'code': 400, 'message': '验证码错误或已过期，请重新获取'}), 400

    stored_code, expires_at = _sms_codes[phone]
    if time.time() > expires_at:
        del _sms_codes[phone]
        return jsonify({'code': 400, 'message': '验证码已过期，请重新获取'}), 400

    if code != stored_code:
        return jsonify({'code': 400, 'message': '验证码错误，请核对后重试'}), 400

    del _sms_codes[phone]

    # 生成 token
    raw = '%s:%s:%s' % (phone, TOKEN_SECRET, time.time())
    token = hashlib.sha256(raw.encode()).hexdigest()

    return jsonify({
        'code': 0,
        'message': '登录成功',
        'token': token,
        'user': {'phone': phone, 'name': ''}
    })


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


@app.route('/download')
def download_page():
    """下载页"""
    return send_from_directory('.', 'download.html')


@app.route('/download/<filename>')
def download_file(filename):
    """下载安装包"""
    allowed = ('app-debug.apk', 'baoshui-apk.zip', 'baoshui-ios-source.zip')
    if filename not in allowed:
        return '', 404
    path = os.path.join(os.path.dirname(__file__), filename)
    if not os.path.isfile(path):
        return '', 404
    return send_from_directory(
        os.path.dirname(path),
        os.path.basename(path),
        as_attachment=True,
        download_name=filename
    )


@app.route('/<path:path>')
def static_files(path):
    if path in ('index.html', 'styles.css', 'app.js', 'config.js'):
        return send_from_directory('.', path)
    return '', 404


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8083, debug=True)
