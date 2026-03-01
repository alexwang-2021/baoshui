/**
 * API 配置 - 按运行环境修改
 * 模拟器: http://10.0.2.2:端口
 * 真机(同局域网): http://电脑IP:端口
 * 公网: https://域名
 */
window.API_CONFIG = {
  BASE_URL: 'http://1.117.47.129:8083',
  ENDPOINTS: {
    SEND_CODE: '/api/sms/send',
    LOGIN: '/api/auth/login'
  }
};
