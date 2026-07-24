# 腾讯云 SCF 主入口部署说明

本目录提供与 Cloudflare Worker 相同 HTTP 契约的腾讯云 SCF HTTP 触发器适配模板。当前仓库不会保存 API Key、SecretId、SecretKey 或真实函数地址。

## 需要准备

1. 注册并完成腾讯云账号实名认证。
2. 创建云函数（Node.js 运行时），配置 HTTP 触发器/API 网关。
3. 配置服务端环境变量：
   - `UPSTREAM_API_KEY`：上游 API Key，只填写在腾讯云函数环境变量中。
   - `UPSTREAM_BASE_URL`：`https://api.avemujica.moe`
   - `UPSTREAM_MODEL`：`gpt-5.6-sol`
   - `ALLOWED_ORIGINS`：`https://53494.github.io,http://localhost:5173,http://127.0.0.1:5173`
4. 将 `cloud/tencent-scf/index.ts` 和 `worker/src/prompt.ts` 的代码部署到函数（具体打包方式按腾讯云控制台当前 Node.js 运行时要求执行）。
5. 记录腾讯云生成的公开 HTTPS 地址，先测试：

```text
GET <腾讯云函数地址>/health
```

应返回：

```json
{"ok":true}
```

## 前端配置

在本地构建环境设置公开地址列表（不是密钥）：

```text
VITE_AI_PROXY_URLS=https://<腾讯云函数地址>,https://recollection-ai-proxy.894721114.workers.dev
```

前端优先访问腾讯云，只有网络失败、502、503 或 504 时才访问 Cloudflare 备用入口。

## 安全要求

- 不要把 `UPSTREAM_API_KEY` 写入 `VITE_` 变量、Git、`docs/` 或浏览器代码。
- 不要把腾讯云 SecretId、SecretKey、登录密码或验证码发送给开发者。
- 如果平台控制台支持 Secret 管理，优先使用 Secret 管理而不是明文环境变量。
- 函数日志不得打印 Authorization Header、请求中的 API Key 或完整上游错误详情。
